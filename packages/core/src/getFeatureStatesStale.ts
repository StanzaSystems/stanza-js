import { getStateProvider } from './globals';
import { createFeatureState } from './models/createFeatureState';
import { type FeatureState } from './models/featureState';

export function getFeatureStatesStale(features: string[]): FeatureState[] {
  const stateProvider = getStateProvider();
  const featureStates = features.map(
    (name) => stateProvider.getFeatureState(name) ?? createFeatureState(name)
  );
  featureStates.forEach((featureState) => {
    stateProvider.setFeatureState(featureState);
  });
  return featureStates;
}
