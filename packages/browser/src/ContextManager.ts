import { type Context, Stanza, utils } from 'stanza-core'

export default async function startBackgroundContextUpdates (): Promise<void> {
  const contexts = utils.globals.getStateProvider().getAllContexts()
  for await (const context of refreshAllContexts(contexts)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const oldContext = contexts.find(c => c.name === context.name)
    if (oldContext !== undefined && !context.equals(oldContext)) {
      console.log('stuff changed')
      self.postMessage({
        type: 'contextUpdated',
        features: context.features
      })
    }
  }
  await poll()
  void startBackgroundContextUpdates()
}

async function * refreshAllContexts (contexts: Context[]): AsyncGenerator<Context> {
  for (let i = 0; i < contexts.length; i++) {
    yield await Stanza.getContextHot(contexts[i].name)
  }
}

// eslint-disable-next-line @typescript-eslint/promise-function-async
function poll (): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, (utils.globals.getConfig().refreshSeconds ?? 10) * 1000))
}
