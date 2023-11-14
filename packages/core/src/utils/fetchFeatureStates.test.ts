import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type ApiFeatureState } from '../api/featureState';
import { type FeatureState } from '../models/featureState';
import { fetchFeatureStates } from './fetchFeatureStates';

const mockFetchApiFeaturesStates = vi.fn<any[], Promise<ApiFeatureState[]>>();
vi.mock('../api/fetchApiFeaturesStates', async () => {
  return {
    fetchApiFeaturesStates: async () => mockFetchApiFeaturesStates(),
  };
});
describe('fetchFeatureStates', () => {
  beforeEach(() => {
    mockFetchApiFeaturesStates.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return list of all features enabled if API returns empty list', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      return [];
    });

    await expect(fetchFeatureStates(['feature1', 'feature2'])).resolves.toEqual(
      [
        {
          featureName: 'feature1',
          enabledPercent: 100,
          lastRefreshTime: 123,
        },
        {
          featureName: 'feature2',
          enabledPercent: 100,
          lastRefreshTime: 123,
        },
      ],
    );
  });

  it('should return list of all features enabled if API takes more than 1000ms', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      await new Promise(() => {});
      return [];
    });

    const featureStatesCallback = vi.fn();

    const featureStatesPromise = fetchFeatureStates([
      'feature1',
      'feature2',
    ]).then(featureStatesCallback);
    await vi.advanceTimersByTimeAsync(1000);
    expect(featureStatesCallback).toHaveBeenCalledOnce();
    expect(featureStatesCallback).toHaveBeenCalledWith([
      {
        featureName: 'feature1',
        enabledPercent: 100,
        lastRefreshTime: 1123,
      },
      {
        featureName: 'feature2',
        enabledPercent: 100,
        lastRefreshTime: 1123,
      },
    ]);
    await expect(featureStatesPromise).resolves.toBeUndefined();
  });

  it('should return list of all features enabled if API request fails', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      throw new Error('kaboom');
    });

    await expect(fetchFeatureStates(['feature1', 'feature2'])).resolves.toEqual(
      [
        {
          featureName: 'feature1',
          enabledPercent: 100,
          lastRefreshTime: 123,
        },
        {
          featureName: 'feature2',
          enabledPercent: 100,
          lastRefreshTime: 123,
        },
      ],
    );
  });

  it('should return list of all features if API returns the whole list', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      return [
        {
          name: 'feature1',
          config: {
            enabledPercent: 90,
          },
        },
        {
          name: 'feature2',
          config: {
            enabledPercent: 80,
          },
        },
      ] satisfies ApiFeatureState[];
    });

    await expect(fetchFeatureStates(['feature1', 'feature2'])).resolves.toEqual(
      [
        {
          featureName: 'feature1',
          enabledPercent: 90,
          lastRefreshTime: 123,
        },
        {
          featureName: 'feature2',
          enabledPercent: 80,
          lastRefreshTime: 123,
        },
      ] satisfies FeatureState[],
    );
  });

  it('should return list of all features if API returns the partial list', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      return [
        {
          name: 'feature1',
          config: {
            enabledPercent: 90,
          },
        },
      ] satisfies ApiFeatureState[];
    });

    await expect(fetchFeatureStates(['feature1', 'feature2'])).resolves.toEqual(
      [
        {
          featureName: 'feature1',
          enabledPercent: 90,
          lastRefreshTime: 123,
        },
        {
          featureName: 'feature2',
          enabledPercent: 100,
          lastRefreshTime: 123,
        },
      ],
    );
  });

  it('should return list of only requested feature if API returns the more features', async () => {
    vi.useFakeTimers({
      now: 123,
    });

    mockFetchApiFeaturesStates.mockImplementation(async () => {
      return [
        {
          name: 'feature1',
          config: {
            enabledPercent: 90,
          },
        },
        {
          name: 'feature2',
          config: {
            enabledPercent: 80,
          },
        },
        {
          name: 'feature3',
          config: {
            enabledPercent: 80,
          },
        },
      ] satisfies ApiFeatureState[];
    });

    await expect(fetchFeatureStates(['feature1', 'feature2'])).resolves.toEqual(
      [
        {
          featureName: 'feature1',
          enabledPercent: 90,
          lastRefreshTime: 123,
        },
        {
          featureName: 'feature2',
          enabledPercent: 80,
          lastRefreshTime: 123,
        },
      ],
    );
  });
});
