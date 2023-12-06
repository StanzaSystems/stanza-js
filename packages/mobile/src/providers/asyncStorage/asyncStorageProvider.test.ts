import { type LocalStateProvider, type FeatureState } from '@getstanza/core';
import { createAsyncLocalStorageStateProvider } from './asyncStorageProvider';
import { asyncStorage } from '../../lib/asyncStorage/asyncStorage';

describe('asyncStorageStateProvider', () => {
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

  beforeEach(async () => {
    stateProvider = createAsyncLocalStorageStateProvider();
    await asyncStorage.clear();
  });

  it('should throw before initialized', async () => {
    await expect(stateProvider.getFeatureState('test')).rejects.toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );

    await expect(
      stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      })
    ).rejects.toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );

    await expect(stateProvider.getAllFeatureStates()).rejects.toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );

    expect(() => {
      stateProvider.addChangeListener(() => {});
    }).toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );

    expect(() => {
      stateProvider.removeChangeListener(() => {});
    }).toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
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
    await asyncStorage.setItem(
      'stanza_feature_test',
      JSON.stringify(testFeatures.first)
    );
    await asyncStorage.setItem(
      'stanza_feature_another-test',
      JSON.stringify(testFeatures.second)
    );
    await asyncStorage.setItem('stanza_config', '{}');

    await stateProvider.init({});

    const getFirstFeature = await asyncStorage.getItem('stanza_feature_test');
    const getSecondFeature = await asyncStorage.getItem(
      'stanza_feature_another-test'
    );

    expect(getFirstFeature).toEqual(JSON.stringify(testFeatures.first));
    expect(getSecondFeature).toEqual(JSON.stringify(testFeatures.second));
  });

  it('should clear existing feature states if no stanza-config exists in local storage', async () => {
    await asyncStorage.setItem(
      'stanza_feature_test',
      JSON.stringify(testFeatures.first)
    );
    await asyncStorage.setItem(
      'stanza_feature_another-test',
      JSON.stringify(testFeatures.second)
    );

    await stateProvider.init({});

    const getFirstFeature = await asyncStorage.getItem('stanza_feature_test');
    const getSecondFeature = await asyncStorage.getItem(
      'stanza_feature_another-test'
    );

    expect(getFirstFeature).toBeNull();
    expect(getSecondFeature).toBeNull();
  });

  it('should clear existing feature states if stanza-config in local storage is different then the new one', async () => {
    await asyncStorage.setItem(
      'stanza_feature_test',
      JSON.stringify(testFeatures.first)
    );
    await asyncStorage.setItem(
      'stanza_feature_another-test',
      JSON.stringify(testFeatures.second)
    );
    await asyncStorage.setItem('stanza_config', '{}');

    await stateProvider.init({ anotherKey: 'anotherValue' });

    const features = await stateProvider.getAllFeatureStates();

    expect(features).not.toContain('stanza_feature_test');
    expect(features).not.toContain('stanza_feature_another-test');
  });

  describe('when initialized', () => {
    beforeEach(async () => {
      await stateProvider.init({});
    });

    it('should return undefined from empty store', async () => {
      const feature = await stateProvider.getFeatureState('firstFeature');
      expect(feature).toBeUndefined();
    });

    it('should store and retrieve a feature', async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      const feature = await stateProvider.getFeatureState('firstFeature');
      expect(feature).toEqual(testFeatures.first);
    });

    it("should return undefined if feature doesn't exist in store", async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      const secondFeature = await stateProvider.getFeatureState(
        'secondFeature'
      );
      expect(secondFeature).toBeUndefined();
    });

    it("should return undefined if feature doesn't exist in store", async () => {
      await stateProvider.setFeatureState(testFeatures.first);
      const secondFeature = await stateProvider.getFeatureState(
        'secondFeature'
      );
      expect(secondFeature).toBeUndefined();
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
