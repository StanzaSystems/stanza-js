import { getStateProvider } from './globals'
import { type FeatureState } from './models/featureState'
import { fetchFeatureStates } from './utils/fetchFeatureStates'

export async function getFeatureStatesHot (features: string[]): Promise<FeatureState[]> {
  const featureStates = await fetchFeatureStates(features)
  const stateProvider = getStateProvider()
  featureStates.forEach(featureState => {
    stateProvider.setFeatureState(featureState)
  })

  return featureStates
}
