import {
  type FeatureState,
  type LocalStateProvider,
  StanzaChangeTarget
} from '@getstanza/core'

const stanzaFeaturePrefix = 'stanza_feature_' as const
type StanzaFeaturePrefix = typeof stanzaFeaturePrefix
type StanzaFeatureKey = `${StanzaFeaturePrefix}${string}`

function setFeatureState (featureState: FeatureState): void {
  const name = featureState.featureName ?? ''
  const key = createStanzaFeatureKey(name)
  const oldFeatureStringValue = localStorage.getItem(key)
  const newFeatureStringValue = JSON.stringify(featureState)
  if (newFeatureStringValue === oldFeatureStringValue) {
    return
  }
  const oldValue = getFeatureState(name)
  localStorage.setItem(key, newFeatureStringValue)
  featureStateChangeEmitter.dispatchChange({ oldValue, newValue: featureState })
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
    messageEnabled: cached.messageEnabled,
    messageDisabled: cached.messageDisabled,
    lastRefreshTime: cached.lastRefreshTime
  }
}

const featureStateChangeEmitter = new StanzaChangeTarget<{ oldValue: FeatureState | undefined, newValue: FeatureState }>()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', ({
    storageArea,
    key,
    oldValue,
    newValue
  }) => {
    if (key !== null && storageArea === localStorage && isStanzaFeatureKey(key) && oldValue !== newValue && newValue !== null) {
      featureStateChangeEmitter.dispatchChange({ oldValue: oldValue !== null ? parseFeature(oldValue) : undefined, newValue: parseFeature(newValue) })
    }
  })
}

export const localStorageStateProvider = {
  getFeatureState,
  setFeatureState,
  getAllFeatureStates,
  addChangeListener: (...args) => featureStateChangeEmitter.addChangeListener(...args),
  removeChangeListener: (...args) => { featureStateChangeEmitter.removeChangeListener(...args) }
} satisfies LocalStateProvider
