import { type FeatureState } from '../models/featureState';
import { createInMemoryLocalStateProvider } from './inMemoryLocalStateProvider';
import { type LocalStateProvider } from '../models/localStateProvider';

describe('InMemoryLocalStateProvider', () => {
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

  beforeEach(() => {
    stateProvider = createInMemoryLocalStateProvider();
  });

  it('should throw before initialized', () => {
    expect(() => {
      stateProvider.getFeatureState('test');
    }).toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    expect(() => {
      stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      });
    }).toThrow(
      'Local Storage State Provider is not initialized. Please invoke `init` method before using the provider.'
    );
    expect(() => {
      stateProvider.getAllFeatureStates();
    }).toThrow(
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

  it('should NOT throw after initialized', () => {
    stateProvider.init({});

    expect(() => {
      stateProvider.getFeatureState('test');
    }).not.toThrow();
    expect(() => {
      stateProvider.setFeatureState({
        featureName: 'test',
        enabledPercent: 100,
        lastRefreshTime: 0,
      });
    }).not.toThrow();
    expect(() => {
      stateProvider.getAllFeatureStates();
    }).not.toThrow();
    expect(() => {
      stateProvider.addChangeListener(() => {});
    }).not.toThrow();
    expect(() => {
      stateProvider.removeChangeListener(() => {});
    }).not.toThrow();
  });

  describe('when initialized', () => {
    beforeEach(() => {
      stateProvider.init({});
    });

    it('should return undefined from empty store', () => {
      expect(stateProvider.getFeatureState('firstFeature')).toBeUndefined();
    });

    it('should store and retrieve a feature', () => {
      stateProvider.setFeatureState(testFeatures.first);
      expect(stateProvider.getFeatureState('firstFeature')).toBe(
        testFeatures.first
      );
    });

    it("should return undefined if feature doesn't exist in store", () => {
      stateProvider.setFeatureState(testFeatures.first);
      expect(stateProvider.getFeatureState('secondFeature')).toBeUndefined();
    });

    it("should return undefined if feature doesn't exist in store", () => {
      stateProvider.setFeatureState(testFeatures.first);
      expect(stateProvider.getFeatureState('secondFeature')).toBeUndefined();
    });

    it('should return all features from the store', () => {
      stateProvider.setFeatureState(testFeatures.first);
      stateProvider.setFeatureState(testFeatures.second);
      stateProvider.setFeatureState(testFeatures.third);
      expect(stateProvider.getAllFeatureStates()).toEqual([
        testFeatures.first,
        testFeatures.second,
        testFeatures.third,
      ]);
    });
  });
});
