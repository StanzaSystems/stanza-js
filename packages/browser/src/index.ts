import { Stanza, StanzaChangeTarget, type StanzaCoreConfig, utils } from '@getstanza/core'
import { createContext, type StanzaContext } from './context'
import { localStorageStateProvider } from './localStorageStateProvider'
export * from './feature'

export type { StanzaContext }

const { getConfig, getEnablementNumber, getEnablementNumberStale } = utils.globals

const contextChanges = new StanzaChangeTarget<StanzaContext>()

export const init = (initialConfig: StanzaCoreConfig): void => {
  Stanza.init(initialConfig, typeof window !== 'undefined' ? localStorageStateProvider : undefined)

  const featureToContextMap = initialConfig.contextConfigs.reduce<Record<string, string[]>>((result, contextConfig) => {
    contextConfig.features.forEach(feature => {
      result[feature] = result[feature] ?? []
      result[feature].push(contextConfig.name)
    })
    return result
  }, {})

  Stanza.featureChanges.addChangeListener((featureState) => {
    featureToContextMap[featureState.featureName].forEach((contextName) => {
      contextChanges.dispatchChange(getContextStale(contextName))
    })
  })

  Stanza.enablementNumberChanges.addChangeListener(() => {
    new Set(Object.values(featureToContextMap).flat()).forEach(contextName => {
      contextChanges.dispatchChange(getContextStale(contextName))
    })
  })
}

export async function getContextHot (name: string): Promise<StanzaContext> {
  const features = getContextFeatures(name)
  const newFeatures = await Stanza.getFeatureStatesHot(features)
  const enablementNumber = await getEnablementNumber()
  return createContext(name, newFeatures, enablementNumber, true)
}

export function getContextStale (name: string): StanzaContext {
  const features = getContextFeatures(name)
  const featureStates = Stanza.getFeatureStatesStale(features)
  const enablementNumber = getEnablementNumberStale()
  return createContext(name, featureStates, enablementNumber, true)
}

export async function getContext (name: string): Promise<StanzaContext> {
  const features = getContextFeatures(name)
  const featureStates = await Stanza.getFeatureStates(features)
  const enablementNumber = await getEnablementNumber()
  return createContext(name, featureStates, enablementNumber, true)
}

function getContextFeatures (name: string): string[] {
  const contextConfig = getConfig().contextConfigs[name]
  if (contextConfig === undefined) {
    throw new Error(`Configuration for context ${name} is not found.`)
  }
  return contextConfig.features
}
export const StanzaBrowser = { init, getContextHot, getContextStale, getContext, featureChanges: Stanza.featureChanges, contextChanges }
export default StanzaBrowser
export type { StanzaCoreConfig }
