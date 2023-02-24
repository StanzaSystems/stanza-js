import { getStateProvider } from './globals'
import { type FeatureState } from './models/featureState'
import { getFeatureStates } from './utils/StanzaService'

export async function getFeatureStatesHot (features: string[]): Promise<FeatureState[]> {
  const featureStates = await getFeatureStates(features)
  const stateProvider = getStateProvider()
  featureStates.forEach(featureState => {
    stateProvider.setFeatureState(featureState)
  })

  return featureStates
}
