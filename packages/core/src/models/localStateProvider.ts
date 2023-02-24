import { type FeatureState } from './featureState'

export interface LocalStateProvider {
  setFeatureState: (context: FeatureState) => void
  getFeatureState: (name?: string) => FeatureState | undefined
  getAllFeatureStates: () => FeatureState[]
}
