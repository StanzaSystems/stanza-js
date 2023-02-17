import type { LocalStateProvider } from './models/LocalStateProvider'
import type { StanzaConfig } from './models/StanzaConfig'
import { createContext, createContextFromBrowserResponse, createContextFromCacheObject, type Context } from './models/Context'
import { ActionCode } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'
import { getBrowserFeatures, createContextFeaturesFromResponse } from './utils/StanzaService'
import globals from './globals'

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
  try {
    // eslint-disable-next-line no-new
    new URL(config.url)
  } catch {
    throw new Error(`${config.url} is not a valid url`)
  }
  globals.init(config, (provider !== undefined) ? provider : InMemoryLocalStateProvider)
}

async function getContextHot (name: string): Promise<Context> {
  const newFeatures = await getBrowserFeatures(name)
  const context = globals.getStateProvider().getContext(name)

  if (context !== undefined) {
    context.refresh(createContextFeaturesFromResponse(newFeatures, context.enablementNumber))
    return context
  }
  return createContextFromBrowserResponse(name, newFeatures)
}

function getContextStale (name: string): Context {
  if (globals.getConfig().contextConfigs.find(c => { return c.name === name }) === undefined) {
    throw new Error(`Configuration for context ${name} is not found.`)
  }
  const context = globals.getStateProvider().getContext(name) ?? createContext(name, [], globals.getEnablementNumber())
  return context
}

async function getContext (name: string): Promise<Context> {
  const context = globals.getStateProvider().getContext(name)
  if (context?.isFresh() === true) {
    return context
  }
  return await getContextHot(name)
}

function saveContextIfChanged (context: Context): boolean {
  const Context = globals.getConfig().contextConfigs.find((e) => { return e.name === context.name })
  if (Context === undefined) {
    throw new Error(`configuration for context ${context.name} not found`)
  }

  // this should only save to local storage if the context has changed. if context hasn't changed, return false for no change
  if (globals.getStateProvider().getContext(context.name)?.equals(context) === true) {
    return false
  }

  globals.getStateProvider().setContext(context, context.name)
  return true
}

export const utils = {
  saveContextIfChanged,
  getBrowserFeatures,
  createContextFromCacheObject
}

export const Stanza = {
  init, getContextHot, getContextStale, getContext
}

export { ActionCode }

export type { Context, StanzaConfig, LocalStateProvider }
