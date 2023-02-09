import type { StanzaConfig, StanzaState } from 'stanza-core'
import Stanza from 'stanza-core'

let config: StanzaConfig
self.onmessage = async (ev: MessageEvent): Promise<void> => {
  if (ev.data.type === 'initialize') {
    config = ev.data.config
    await processFeatureGroups()
  } else {
    throw new Error('Unknown message type sent to Stanza worker')
  }
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
function poll (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, (config.RefreshSeconds ?? 10) * 1000))
}

async function processFeatureGroups (): Promise<void> {
  for await (const state of getAllFeatures()) {
    self.postMessage({
      data: {
        type: 'stateUpdated',
        state
      }
    })
  }
  await poll()
  void processFeatureGroups()
}

async function * getAllFeatures (): AsyncGenerator<StanzaState> {
  for (let i = 0; i < config.FeatureGroups.length; i++) {
    yield await Stanza.getRefreshStateForFeatures(config.FeatureGroups[i].Name, config)
  }
}

export {}
