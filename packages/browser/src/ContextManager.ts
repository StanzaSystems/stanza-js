import { type Context, Stanza, utils } from 'stanza-core'

export default async function startBackgroundContextUpdates (): Promise<void> {
  const contexts = utils.globals.getStateProvider().getAllContexts()
  for await (const { newContext, oldContext } of refreshAllContexts(contexts)) {
    if (oldContext !== undefined && !newContext.equals(oldContext)) {
      console.log('stuff changed')
      self.postMessage({
        type: 'contextUpdated',
        features: newContext.features
      })
    }
  }
  await poll()
  void startBackgroundContextUpdates()
}

async function * refreshAllContexts (contexts: Context[]): AsyncGenerator<{ newContext: Context, oldContext: Context }> {
  for (let i = 0; i < contexts.length; i++) {
    const oldContext = contexts[i]
    const newContext = await Stanza.getContextHot(oldContext.name)
    yield { newContext, oldContext }
  }
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
function poll (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, (utils.globals.getConfig().refreshSeconds ?? 10) * 1000))
}
