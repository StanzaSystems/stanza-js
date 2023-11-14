import { type FeatureState } from '../models/featureState';
import { type LocalStateProvider } from '../models/localStateProvider';
import { StanzaChangeTarget } from '../eventEmitter';

export const createInMemoryLocalStateProvider = (): LocalStateProvider => {
  const localState = new Map<string, FeatureState>();
  let initialized = false;

  function setFeatureState(featureState: FeatureState): void {
    assertInitialized();
    const { featureName } = featureState;
    const oldValue = localState.get(featureName);

    if (oldValue === featureState) {
      return;
    }

    localState.set(featureName, featureState);
    featureStateChangeEmitter.dispatchChange({
      oldValue,
      newValue: featureState,
    });
  }

  function getFeatureState(name?: string): FeatureState | undefined {
    assertInitialized();
    return localState.get(name ?? '');
  }

  function getAllFeatureStates(): FeatureState[] {
    assertInitialized();
    return Array.from(localState.values());
  }

  function assertInitialized() {
    if (!initialized) {
      throw new Error(
        'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.',
      );
    }
  }

  const featureStateChangeEmitter = new StanzaChangeTarget<{
    oldValue: FeatureState | undefined;
    newValue: FeatureState;
  }>();

  return {
    init: () => {
      initialized = true;
    },
    getFeatureState,
    setFeatureState,
    getAllFeatureStates,
    addChangeListener: (...args) => {
      assertInitialized();
      return featureStateChangeEmitter.addChangeListener(...args);
    },
    removeChangeListener: (...args) => {
      assertInitialized();
      featureStateChangeEmitter.removeChangeListener(...args);
    },
  };
};
