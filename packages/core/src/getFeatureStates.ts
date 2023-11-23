import { getFeatureStatesHot } from './getFeatureStatesHot';
import {
  getFeatureStatesStale,
  getFeatureStatesStaleAsync,
} from './getFeatureStatesStale';
import { type FeatureState } from './models/featureState';
import { isFeatureStateFresh } from './models/isFeatureStateFresh';

export async function getFeatureStates(
  features: string[]
): Promise<FeatureState[]> {
  const featureStates = getFeatureStatesStale(features);
  if (
    featureStates.every(isFeatureStateFresh) &&
    features.every(
      (featureName) =>
        featureStates.findIndex(
          (state) => state.featureName === featureName
        ) !== -1
    )
  ) {
    return featureStates;
  }
  return getFeatureStatesHot(features);
}

export async function getFeatureStatesAsync(
  features: string[]
): Promise<FeatureState[]> {
  const featureStates = await getFeatureStatesStaleAsync(features);
  if (
    featureStates.every(isFeatureStateFresh) &&
    features.every(
      (featureName) =>
        featureStates.findIndex(
          (state) => state.featureName === featureName
        ) !== -1
    )
  ) {
    return featureStates;
  }
  return getFeatureStatesHot(features);
}
