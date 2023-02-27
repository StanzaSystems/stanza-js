import { getFeatureStatesHot } from './getFeatureStatesHot'
import { getFeatureStatesStale } from './getFeatureStatesStale'
import { type FeatureState } from './models/featureState'
import { isFeatureStateFresh } from './models/isFeatureFresh'

export async function getFeatureStates (features: string[]): Promise<FeatureState[]> {
  const featureStates = getFeatureStatesStale(features)
  if (featureStates.every(isFeatureStateFresh)) {
    return featureStates
  }
  return getFeatureStatesHot(features)
}
