import { type ApiFeatureState } from '../api/featureState'
import { fetchApiFeaturesStates } from '../api/fetchApiFeaturesStates'
import { createFeatureState } from '../models/createFeatureState'
import { type FeatureState } from '../models/featureState'
import { groupBy } from '../groupBy'
import { identity } from '../identity'

const apiFeatureStateToFeatureState = (refreshTime: number) => (api: ApiFeatureState): FeatureState => ({
  featureName: api.name,
  lastRefreshTime: refreshTime,
  ...api.config
})

export async function fetchFeatureStates (features: string[]): Promise<FeatureState[]> {
  const apiFeatureStates = await fetchApiFeaturesStates(features)
  const refreshTime = Date.now()
  const groupedFeatures = apiFeatureStates.map(apiFeatureStateToFeatureState(refreshTime)).reduce(groupBy('featureName', identity), {})

  return features.map((featureName): FeatureState => groupedFeatures[featureName] ?? createFeatureState(featureName, refreshTime))
}
