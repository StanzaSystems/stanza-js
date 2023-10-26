import { type FeatureState } from '../models/featureState'
import { type LocalStateProvider } from '../models/localStateProvider'
import { StanzaChangeTarget } from '../eventEmitter'

export const createInMemoryLocalStateProvider = (): LocalStateProvider => {
  const localState = new Map<string, FeatureState>()

  function setFeatureState (featureState: FeatureState): void {
    const { featureName } = featureState
    const oldValue = localState.get(featureName)

    if (oldValue === featureState) {
      return
    }

    localState.set(featureName, featureState)
    featureStateChangeEmitter.dispatchChange({ oldValue, newValue: featureState })
  }

  function getFeatureState (name?: string): FeatureState | undefined {
    return localState.get(name ?? '')
  }

  function getAllFeatureStates (): FeatureState[] {
    return Array.from(localState.values())
  }

  const featureStateChangeEmitter = new StanzaChangeTarget<{ oldValue: FeatureState | undefined, newValue: FeatureState }>()

  return {
    getFeatureState,
    setFeatureState,
    getAllFeatureStates,
    addChangeListener: (...args) => featureStateChangeEmitter.addChangeListener(...args),
    removeChangeListener: (...args) => { featureStateChangeEmitter.removeChangeListener(...args) }
  }
}
