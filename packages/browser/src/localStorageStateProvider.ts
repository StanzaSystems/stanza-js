import {
  type FeatureState,
  type LocalStateProvider,
  StanzaChangeTarget,
} from '@getstanza/core';

const stanzaFeaturePrefix = 'stanza_feature_' as const;
type StanzaFeaturePrefix = typeof stanzaFeaturePrefix;
type StanzaFeatureKey = `${StanzaFeaturePrefix}${string}`;
const STANZA_CONFIG_KEY = 'stanza_config';

function parseFeature(featureSerialized: string): FeatureState {
  return createFeatureFromCacheObject(JSON.parse(featureSerialized));
}

function createStanzaFeatureKey(name: string): StanzaFeatureKey {
  return `${stanzaFeaturePrefix}${name}`;
}

function isStanzaFeatureKey(key: string): key is StanzaFeatureKey {
  return key.startsWith(stanzaFeaturePrefix);
}

function createFeatureFromCacheObject(cached: any): FeatureState {
  if (cached === null || typeof cached !== 'object') {
    throw new Error('Invalid stanza feature value in cache');
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

export const createLocalStorageStateProvider = (): LocalStateProvider => {
  let initialized = false;
  async function setFeatureState(featureState: FeatureState): Promise<void> {
    assertInitialized();
    const name = featureState.featureName ?? '';
    const key = createStanzaFeatureKey(name);
    const oldFeatureStringValue = localStorage.getItem(key);
    const newFeatureStringValue = JSON.stringify(featureState);
    if (newFeatureStringValue === oldFeatureStringValue) {
      return;
    }
    const oldValue = getFeatureState(name);
    localStorage.setItem(key, newFeatureStringValue);
    await featureStateChangeEmitter.dispatchChange({
      oldValue,
      newValue: featureState,
    });
  }

  function getFeatureState(name: string): FeatureState | undefined {
    assertInitialized();
    const featureSerialized = localStorage.getItem(
      createStanzaFeatureKey(name)
    );
    if (featureSerialized === null) {
      return undefined;
    }
    return parseFeature(featureSerialized);
  }

  function getAllFeatureStates(): FeatureState[] {
    assertInitialized();
    return getAllStateKeys()
      .map((key) => localStorage.getItem(key) as string)
      .map(parseFeature);
  }

  function assertInitialized() {
    if (!initialized) {
      throw new Error(
        'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
      );
    }
  }

  return {
    init: (config) => {
      const configString = JSON.stringify(config);
      const existingConfig = localStorage.getItem(STANZA_CONFIG_KEY);

      if (configString !== existingConfig) {
        localStorage.setItem(STANZA_CONFIG_KEY, configString);
        getAllStateKeys().forEach((key) => {
          localStorage.removeItem(key);
        });
      }

      window.addEventListener(
        'storage',
        ({ storageArea, key, oldValue, newValue }) => {
          if (
            key !== null &&
            storageArea === localStorage &&
            isStanzaFeatureKey(key) &&
            oldValue !== newValue &&
            newValue !== null
          ) {
            featureStateChangeEmitter
              .dispatchChange({
                oldValue:
                  oldValue !== null ? parseFeature(oldValue) : undefined,
                newValue: parseFeature(newValue),
              })
              .catch((e) => {
                console.warn('Failed to dispatch change', e);
              });
          }
        }
      );

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

function getAllStateKeys() {
  return Object.keys(localStorage).filter(isStanzaFeatureKey);
}
