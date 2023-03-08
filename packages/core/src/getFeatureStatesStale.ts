import { getStateProvider } from './globals'
import { createFeatureState } from './models/createFeatureState'
import { type FeatureState } from './models/featureState'

export function getFeatureStatesStale (features: string[]): FeatureState[] {
  const featureStates = features.map(name => getStateProvider().getFeatureState(name) ?? createFeatureState(name))
  const stateProvider = getStateProvider()
  featureStates.forEach(featureState => {
    stateProvider.setFeatureState(featureState)
  })
  return featureStates
}
