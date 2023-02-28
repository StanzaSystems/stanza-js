import { type FeatureState, type LocalStateProvider } from 'stanza-core'

const stanzaFeaturePrefix = 'stanza_feature_' as const
type StanzaFeaturePrefix = typeof stanzaFeaturePrefix
type StanzaFeatureKey = `${StanzaFeaturePrefix}${string}`

function setFeatureState (feature: FeatureState): void {
  const name = feature.featureName ?? ''
  console.log(`storing ${name}`)
  localStorage.setItem(createStanzaFeatureKey(name), JSON.stringify(feature))
}

function getFeatureState (name?: string): FeatureState | undefined {
  const featureSerialized = localStorage.getItem(createStanzaFeatureKey(name ?? ''))
  if (featureSerialized === null) {
    return undefined
  }
  return parseFeature(featureSerialized)
}

function getAllFeatureStates (): FeatureState[] {
  return Object.keys(localStorage)
    .filter(isStanzaFeatureKey)
    .map(key => localStorage.getItem(key) as string)
    .map(parseFeature)
}

function parseFeature (featureSerialized: string): FeatureState {
  return createFeatureFromCacheObject(JSON.parse(featureSerialized))
}

function createStanzaFeatureKey (name: string): StanzaFeatureKey {
  return `${stanzaFeaturePrefix}${name}`
}

function isStanzaFeatureKey (key: string): key is StanzaFeatureKey {
  return key.startsWith(stanzaFeaturePrefix)
}

function createFeatureFromCacheObject (cached: any): FeatureState {
  if (cached === null || typeof cached !== 'object') {
    throw new Error('Invalid stanza feature value in cache')
  }
  if (!('featureName' in cached) || typeof cached.featureName !== 'string') {
    throw new Error('Invalid stanza context name in cache')
  }
  return {
    featureName: cached.featureName,
    enabledPercent: cached.enabledPercent,
    actionCodeEnabled: cached.actionCodeEnabled,
    messageEnabled: cached.messageEnabled,
    actionCodeDisabled: cached.actionCodeDisabled,
    messageDisabled: cached.messageDisabled,
    lastRefreshTime: cached.lastRefreshTime
  }
}

export default {
  getFeatureState,
  setFeatureState,
  getAllFeatureStates
} satisfies LocalStateProvider
