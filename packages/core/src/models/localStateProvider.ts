import { type FeatureState } from './featureState'

type LocalStateChangeListener = (event: { oldValue: FeatureState | undefined, newValue: FeatureState }) => void

export interface LocalStateProvider {
  init: (config: unknown) => void
  setFeatureState: (context: FeatureState) => void
  getFeatureState: (name?: string) => FeatureState | undefined
  getAllFeatureStates: () => FeatureState[]
  addChangeListener: (callback: LocalStateChangeListener) => () => void
  removeChangeListener: (callback: LocalStateChangeListener) => void
}
