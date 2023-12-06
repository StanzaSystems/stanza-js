import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { StanzaChangeTarget } from './eventEmitter';
import { type FeatureState } from './models/featureState';
import { startPollingFeatureStateUpdates } from './startPollingFeatureStateUpdates';
import { createInMemoryLocalStateProvider } from './utils/inMemoryLocalStateProvider';
import { type LocalStateProvider } from './models/localStateProvider';
import type * as getFeatureStatesHotModule from './getFeatureStatesHot';

type GetFeatureStatesHotModule = typeof getFeatureStatesHotModule;

const mockGetFeaturesStatesHot = vi.fn();
const mockGetConfig = vi.fn();
const mockGetStateProvider = vi.fn();

vi.mock('./getFeatureStatesHot', () => {
  return {
    getFeatureStatesHot: (...args) => mockGetFeaturesStatesHot(...args),
  } satisfies GetFeatureStatesHotModule;
});

vi.mock('./globals', () => {
  return {
    getConfig: () => mockGetConfig(),
    getStateProvider: () => mockGetStateProvider(),
    featureChanges: new StanzaChangeTarget(),
    enablementNumberChanges: new StanzaChangeTarget(),
  };
});
describe('pollFeatureStateUpdates', () => {
  const hotFeatureStates: FeatureState[] = [
    {
      featureName: 'testFeature1',
      enabledPercent: 85,
      lastRefreshTime: 1234,
    },
    {
      featureName: 'testFeature2',
      enabledPercent: 90,
      lastRefreshTime: 1234,
    },
  ];
  let localStateProvider: LocalStateProvider;

  beforeEach(async () => {
    localStateProvider = createInMemoryLocalStateProvider();
    await localStateProvider.init({});
    mockGetFeaturesStatesHot.mockReset();
    mockGetConfig.mockReset();
    mockGetStateProvider.mockImplementation(() => localStateProvider);
    mockGetFeaturesStatesHot.mockImplementation(async () => {
      return Promise.resolve(hotFeatureStates);
    });
    mockGetConfig.mockImplementation(() => {
      return {
        refreshSeconds: 1,
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should poll no features if localStateProvider is empty', async () => {
    vi.useFakeTimers();

    void startPollingFeatureStateUpdates();

    await vi.advanceTimersByTimeAsync(500);

    expect(mockGetFeaturesStatesHot).toHaveBeenCalledWith([]);
  });

  it('should poll only features that exist in localStateProvider', async () => {
    vi.useFakeTimers();
    await localStateProvider.setFeatureState({
      featureName: 'testFeature1',
      enabledPercent: 100,
      lastRefreshTime: 123,
    });

    void startPollingFeatureStateUpdates();

    await vi.advanceTimersByTimeAsync(500);

    expect(mockGetFeaturesStatesHot).toHaveBeenCalledWith(['testFeature1']);
  });

  it('should poll for new changes after refresh time has passed', async () => {
    vi.useFakeTimers();
    await localStateProvider.setFeatureState({
      featureName: 'testFeature1',
      enabledPercent: 100,
      lastRefreshTime: 123,
    });

    void startPollingFeatureStateUpdates();

    await vi.advanceTimersByTimeAsync(500);

    expect(mockGetFeaturesStatesHot).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(500);

    expect(mockGetFeaturesStatesHot).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1000);

    expect(mockGetFeaturesStatesHot).toHaveBeenCalledTimes(3);
  });
});
