import { getStateProvider } from './globals'
import { createFeatureState } from './models/createFeatureState'
import { type FeatureState } from './models/featureState'

export function getFeatureStatesStale (features: string[]): FeatureState[] {
  return features.map(name => getStateProvider().getFeatureState(name) ?? createFeatureState(name))
}
