import { Stanza, type StanzaCoreConfig, utils } from 'stanza-core'
import { type Context, createContext } from './context'
import localState from './localStorageStateProvider'

export type { Context }

const { getConfig } = utils.globals

export const init = (initialConfig: StanzaCoreConfig): void => {
  Stanza.init(initialConfig, localState)
}

export async function getContextHot (name: string): Promise<Context> {
  const features = getContextFeatures(name)
  const newFeatures = await Stanza.getFeatureStatesHot(features)
  return createContext(name, newFeatures, true)
}

export function getContextStale (name: string): Context {
  const features = getContextFeatures(name)
  const featureStates = Stanza.getFeatureStatesStale(features)
  return createContext(name, featureStates, true)
}

export async function getContext (name: string): Promise<Context> {
  const features = getContextFeatures(name)
  const featureStates = await Stanza.getFeatureStates(features)
  return createContext(name, featureStates, true)
}

function getContextFeatures (name: string): string[] {
  const contextConfig = getConfig().contextConfigs[name]
  if (contextConfig === undefined) {
    throw new Error(`Configuration for context ${name} is not found.`)
  }
  return contextConfig.features
}
export const StanzaBrowser = { init, getContextHot, getContextStale, getContext }
export default StanzaBrowser
export type { StanzaCoreConfig }
