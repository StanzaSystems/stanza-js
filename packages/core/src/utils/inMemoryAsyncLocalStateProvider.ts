import { type FeatureState } from '../models/featureState';
import { type AsyncLocalStateProvider } from '../models/localStateProvider';
import { StanzaChangeTarget } from '../eventEmitter';

export const createInMemoryAsyncLocalStateProvider =
  (): AsyncLocalStateProvider => {
    const localState = new Map<string, FeatureState>();
    let initialized = false;

    async function setFeatureState(featureState: FeatureState): Promise<void> {
      assertInitialized();
      const { featureName } = featureState;
      const oldValue = localState.get(featureName);

      if (oldValue === featureState) {
        return;
      }

      await new Promise((resolve) => {
        localState.set(featureName, featureState);
        resolve(featureState);
      });

      featureStateChangeEmitter.dispatchChange({
        oldValue,
        newValue: featureState,
      });
    }

    async function getFeatureState(
      name?: string
    ): Promise<FeatureState | undefined> {
      assertInitialized();

      return new Promise((resolve) => {
        const featureState = localState.get(name ?? '');
        resolve(featureState);
      });
    }

    async function getAllFeatureStates(): Promise<FeatureState[]> {
      assertInitialized();
      return new Promise((resolve) => {
        const featureStates = Array.from(localState.values());
        resolve(featureStates);
      });
    }

    function assertInitialized() {
      if (!initialized) {
        throw new Error(
          'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
        );
      }
    }

    const featureStateChangeEmitter = new StanzaChangeTarget<{
      oldValue: FeatureState | undefined;
      newValue: FeatureState;
    }>();

    return {
      init: async () => {
        return new Promise((resolve) => {
          initialized = true;
          resolve();
        });
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
