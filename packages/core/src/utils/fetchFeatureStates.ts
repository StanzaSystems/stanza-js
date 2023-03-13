import { fetchApiFeaturesStates } from '../api/fetchApiFeaturesStates'
import { groupBy, identity } from '../index'
import { createFeatureState } from '../models/createFeatureState'
import { type FeatureState } from '../models/featureState'

export async function fetchFeatureStates (features: string[]): Promise<FeatureState[]> {
  const apiFeatureStates = await fetchApiFeaturesStates(features)
  const refreshTime = Date.now()
  const groupedFeatures = apiFeatureStates.map((apiFeatureState): FeatureState => ({
    ...apiFeatureState,
    lastRefreshTime: refreshTime
  })).reduce(groupBy('featureName', identity), {})

  return features.map((featureName): FeatureState => groupedFeatures[featureName] ?? createFeatureState(featureName, refreshTime))
}
