import { type FeatureState } from '../models/featureState';
import { createInMemoryAsyncLocalStateProvider } from './inMemoryAsyncLocalStateProvider';
import { type AsyncLocalStateProvider } from '../models/localStateProvider';

describe('InMemoryLocalStateProvider', () => {
  let stateProvider: AsyncLocalStateProvider;

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

  beforeEach(() => {
    stateProvider = createInMemoryAsyncLocalStateProvider();
  });

  it('should throw before initialized', async () => {
    await expect(async () => {
      await stateProvider.getFeatureState('test');
    }).rejects.toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    await expect(async () => {
      await stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      });
    }).rejects.toThrow(
      'Async Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    await expect(async () => {
      await stateProvider.getAllFeatureStates();
    }).rejects.toThrow(
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
    expect(stateProvider.addChangeListener(() => {})).not.toThrow();
    expect(() => {
      stateProvider.removeChangeListener(() => {});
    }).not.toThrow();
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
      expect(feature).toBe(testFeatures.first);
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
      const allFeatures = await stateProvider.getAllFeatureStates();
      expect(allFeatures).toEqual([
        testFeatures.first,
        testFeatures.second,
        testFeatures.third,
      ]);
    });
  });
});
