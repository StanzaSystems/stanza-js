import { type FeatureState } from './featureState';

export const createFeatureState = (
  featureName: string,
  lastRefreshTime = 0
): FeatureState => ({
  featureName,
  enabledPercent: 100,
  lastRefreshTime,
});
