import { type FeatureState } from '../models/featureState'
import { type LocalStateProvider } from '../models/localStateProvider'

const localState = new Map<string, FeatureState>()

function setFeatureState (featureState: FeatureState): void {
  const { featureName } = featureState
  localState.set(featureName, featureState)
}

function getFeatureState (name?: string): FeatureState | undefined {
  return localState.get(name ?? '')
}

function getAllFeatureStates (): FeatureState[] {
  return Array.from(localState.values())
}

const provider: LocalStateProvider = {
  getFeatureState,
  setFeatureState,
  getAllFeatureStates
}

export default provider
