import {
  type FeatureState,
  StanzaChangeTarget,
  AsyncLocalStateProvider,
} from '@getstanza/core';
import { asyncStorage } from '../../lib/asyncStorage/asyncStorage';

const stanzaFeaturePrefix = 'stanza_feature_' as const;
export type StanzaFeaturePrefix = typeof stanzaFeaturePrefix;
export type StanzaFeatureKey = `${StanzaFeaturePrefix}${string}`;
const STANZA_CONFIG_KEY = 'stanza_config';

function parseFeature(featureSerialized: string): FeatureState {
  try {
    const cache = JSON.parse(featureSerialized);

    return createFeatureFromCacheObject(cache);
  } catch (e) {
    throw new Error('Failed to parse feature');
  }
}

function createStanzaFeatureKey(name: string): StanzaFeatureKey {
  return `${stanzaFeaturePrefix}${name}`;
}

function isStanzaFeatureKey(key: string): key is StanzaFeatureKey {
  return key.startsWith(stanzaFeaturePrefix);
}

function createFeatureFromCacheObject(cached: any): FeatureState {
  if (cached === null || typeof cached !== 'object') {
    throw new Error('Cache is null or not an object');
  }

  if (!('featureName' in cached) || typeof cached.featureName !== 'string') {
    throw new Error('Invalid stanza context name in cache');
  }

  return {
    featureName: cached.featureName,
    enabledPercent: cached.enabledPercent,
    messageEnabled: cached.messageEnabled,
    messageDisabled: cached.messageDisabled,
    lastRefreshTime: cached.lastRefreshTime,
  };
}

const featureStateChangeEmitter = new StanzaChangeTarget<{
  oldValue: FeatureState | undefined;
  newValue: FeatureState;
}>();

export const createAsyncLocalStorageStateProvider =
  (): AsyncLocalStateProvider => {
    let initialized = false;

    async function setFeatureState(featureState: FeatureState): Promise<void> {
      assertInitialized();

      const name = featureState.featureName ?? '';

      const key = createStanzaFeatureKey(name);

      const oldFeatureStringValue = await asyncStorage.getItem(key);

      const newFeatureStringValue = JSON.stringify(featureState);

      if (newFeatureStringValue === oldFeatureStringValue) {
        return;
      }

      const oldValue = await getFeatureState(name);

      await asyncStorage.setItem(key, newFeatureStringValue);

      featureStateChangeEmitter.dispatchChange({
        oldValue,
        newValue: featureState,
      });
    }

    async function getFeatureState(
      name: string
    ): Promise<FeatureState | undefined> {
      assertInitialized();
      const featureSerialized = await asyncStorage.getItem(
        createStanzaFeatureKey(name)
      );

      if (featureSerialized === null) {
        return undefined;
      }

      return parseFeature(featureSerialized);
    }

    async function getAllFeatureStates(): Promise<FeatureState[]> {
      assertInitialized();

      const getAllKeys = await getAllStateKeys();

      return Promise.all(
        getAllKeys.map(async (key) => {
          const value = await asyncStorage.getItem(key);
          return parseFeature(value as string);
        })
      );
    }

    function assertInitialized() {
      if (!initialized) {
        throw new Error(
          'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
        );
      }
    }

    return {
      init: async (config) => {
        const configString = JSON.stringify(config);
        const existingConfig = await asyncStorage.getItem(STANZA_CONFIG_KEY);

        if (configString !== existingConfig) {
          await asyncStorage.setItem(STANZA_CONFIG_KEY, configString);

          const getAllKeys = await getAllStateKeys();

          await Promise.all(
            getAllKeys.map(async (key) => {
              await asyncStorage.removeItem(key);
            })
          );
        }

        asyncStorage.addEventListener(({ key, oldValue, newValue }) => {
          if (
            key !== null &&
            isStanzaFeatureKey(key) &&
            oldValue !== newValue &&
            newValue !== null
          ) {
            featureStateChangeEmitter.dispatchChange({
              oldValue: oldValue ? parseFeature(oldValue) : undefined,
              newValue: parseFeature(newValue),
            });
          }
        });
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

async function getAllStateKeys() {
  const getAllKeys = await asyncStorage.getAllKeys();

  return getAllKeys.filter(isStanzaFeatureKey);
}
