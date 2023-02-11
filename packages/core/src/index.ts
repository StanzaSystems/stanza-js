import type { LocalStateProvider } from './models/LocalStateProvider'
import type { StanzaConfig } from './models/StanzaConfig'
import { createContext, type Context } from './models/Context'
import { FeatureStatusCode } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'
import { getRefreshedFeatures } from './utils/StanzaService'
import globals from './globals'

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
  try {
    // eslint-disable-next-line no-new
    new URL(config.url)
  } catch {
    throw new Error(`${config.url} is not a valid url`)
  }
  globals.init(config, (provider != null) ? provider : InMemoryLocalStateProvider)
}

async function getContextHot (name: string): Promise<Context> {
  const newFeatures = await getRefreshedFeatures(name)
  const context = globals.getStateProvider().getContext(name)

  if (context !== undefined) {
    context.refresh(newFeatures)
    return context
  }
  return createContext(name, newFeatures, true)
}

function getContextLazy (name: string): Context {
  if (globals.getConfig().contextConfigs.find(c => { return c.name === name }) === undefined) {
    throw new Error(`Configuration for context ${name} is not found.`)
  }
  const context = globals.getStateProvider().getContext(name) ?? createContext(name, [])
  return context
}

function saveContextIfChanged (context: Context): boolean {
  const Context = globals.getConfig().contextConfigs.find((e) => { return e.name === context.name })
  if (Context === undefined) {
    throw new Error(`configuration for context ${context.name} not found`)
  }

  // this should only save to local storage if the context has changed. if context hasn't changed, return false for no change
  if (globals.getStateProvider().getContext(context.name)?.equals(context.features) === true) {
    return false
  }

  globals.getStateProvider().setContext(context, context.name)
  return true
}

export default { init, getContextHot, getContextLazy, FeatureStatusCode, saveContextIfChanged, getRefreshedFeatures }
export type { Context, StanzaConfig, LocalStateProvider }
