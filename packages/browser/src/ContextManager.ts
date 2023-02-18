import { type Context, Stanza, utils } from 'stanza-core'

export default async function startBackgroundContextUpdates (): Promise<void> {
  for await (const context of refreshAllContexts()) {
    const changed = utils.saveContextIfChanged(context)
    if (changed) {
      self.postMessage({
        type: 'contextUpdated',
        context
      })
    }
  }
  await poll()
  void startBackgroundContextUpdates()
}

async function * refreshAllContexts (): AsyncGenerator<Context> {
  const contexts = utils.globals.getStateProvider().getAllContexts()
  for (let i = 0; i < contexts.length; i++) {
    yield await Stanza.getContextHot(contexts[i].name)
  }
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
function poll (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, (utils.globals.getConfig().refreshSeconds ?? 10) * 1000))
}
