import { type FeatureState, type LocalStateProvider } from '@getstanza/core';
import { createLocalStorageStateProvider } from './localStorageStateProvider';
describe('localStorageStateProvider', () => {
  let stateProvider: LocalStateProvider;

  const testFeatures = {
    first: {
      featureName: 'firstFeature',
      lastRefreshTime: 123,
      enabledPercent: 100,
    },
    second: {
      featureName: 'secondFeature',
      lastRefreshTime: 124,
      enabledPercent: 80,
      messageDisabled: 'Message disabled',
      messageEnabled: 'Message enabled',
    },
    third: {
      featureName: 'thirdFeature',
      lastRefreshTime: 125,
      enabledPercent: 0,
      messageDisabled: 'Third feature is messed up',
    },
  } satisfies Record<string, FeatureState>;

  afterAll(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    stateProvider = createLocalStorageStateProvider();
    localStorage.clear();
  });

  it('should throw before initialized', async () => {
    await expect(stateProvider.getFeatureState('test')).rejects.toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    await expect(
      stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      })
    ).rejects.toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    await expect(stateProvider.getAllFeatureStates()).rejects.toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    expect(() => {
      stateProvider.addChangeListener(() => {});
    }).toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    expect(() => {
      stateProvider.removeChangeListener(() => {});
    }).toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
  });

  it('should NOT throw after initialized', async () => {
    await stateProvider.init({});

    await expect(stateProvider.getFeatureState('test')).resolves.not.toThrow();
    await expect(
      stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      })
    ).resolves.not.toThrow();
    await expect(stateProvider.getAllFeatureStates()).resolves.not.toThrow();
    expect(() => {
      stateProvider.addChangeListener(() => {});
    }).not.toThrow();
    expect(() => {
      stateProvider.removeChangeListener(() => {});
    }).not.toThrow();
  });

  it('should NOT clear existing feature states if stanza-config in local storage is same as new one', async () => {
    localStorage.setItem('stanza_feature_test', 'dummy-value');
    localStorage.setItem('stanza_feature_another-test', 'another-dummy-value');
    localStorage.setItem('stanza_config', '{}');

    await stateProvider.init({});

    expect(Object.keys(localStorage)).toContain('stanza_feature_test');
    expect(Object.keys(localStorage)).toContain('stanza_feature_another-test');
  });

  it('should clear existing feature states if no stanza-config exists in local storage', async () => {
    localStorage.setItem('stanza_feature_test', 'dummy-value');
    localStorage.setItem('stanza_feature_another-test', 'another-dummy-value');

    await stateProvider.init({});

    expect(Object.keys(localStorage)).not.toContain('stanza_feature_test');
    expect(Object.keys(localStorage)).not.toContain(
      'stanza_feature_another-test'
    );
  });

  it('should clear existing feature states if stanza-config in local storage is different then the new one', async () => {
    localStorage.setItem('stanza_feature_test', 'dummy-value');
    localStorage.setItem('stanza_feature_another-test', 'another-dummy-value');
    localStorage.setItem('stanza_config', '{}');

    await stateProvider.init({ anotherKey: 'anotherValue' });

    expect(Object.keys(localStorage)).not.toContain('stanza_feature_test');
    expect(Object.keys(localStorage)).not.toContain(
      'stanza_feature_another-test'
    );
  });

  describe('when initialized', () => {
    beforeEach(async () => {
      await stateProvider.init({});
    });

    it('should return undefined from empty store', async () => {
      await expect(
        stateProvider.getFeatureState('firstFeature')
      ).resolves.toBeUndefined();
    });

    it('should store and retrieve a feature', async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      await expect(
        stateProvider.getFeatureState('firstFeature')
      ).resolves.toEqual(testFeatures.first);
    });

    it("should return undefined if feature doesn't exist in store", async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      await expect(
        stateProvider.getFeatureState('secondFeature')
      ).resolves.toBeUndefined();
    });

    it("should return undefined if feature doesn't exist in store", async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      await expect(
        stateProvider.getFeatureState('secondFeature')
      ).resolves.toBeUndefined();
    });

    it('should return all features from the store', async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      await stateProvider.setFeatureState(testFeatures.second);
      await stateProvider.setFeatureState(testFeatures.third);
      const features = await stateProvider.getAllFeatureStates();
      expect(features).toEqual([
        testFeatures.first,
        testFeatures.second,
        testFeatures.third,
      ]);
    });
  });
});
