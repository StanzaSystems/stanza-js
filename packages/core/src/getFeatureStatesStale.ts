import { getStateProvider } from './globals'
import { type FeatureState } from './models/featureState'

export function getFeatureStatesStale (features: string[]): FeatureState[] {
  return features.map(name => getStateProvider().getFeatureState(name) ?? {
    featureName: name,
    enabledPercent: 100,
    lastRefreshTime: 0
  })
}
