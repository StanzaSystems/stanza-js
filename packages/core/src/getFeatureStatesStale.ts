import { getStateProvider } from './globals';
import { createFeatureState } from './models/createFeatureState';
import { type FeatureState } from './models/featureState';
import {
  type AsyncLocalStateProvider,
  type LocalStateProvider,
} from './models/localStateProvider';

export function getFeatureStatesStale(features: string[]): FeatureState[] {
  const stateProvider = getStateProvider() as LocalStateProvider;
  const featureStates = features.map(
    (name) => stateProvider.getFeatureState(name) ?? createFeatureState(name)
  );
  featureStates.forEach((featureState) => {
    stateProvider.setFeatureState(featureState);
  });
  return featureStates;
}

export async function getFeatureStatesStaleAsync(
  features: string[]
): Promise<FeatureState[]> {
  const stateProvider = getStateProvider() as AsyncLocalStateProvider;
  const featureStates = await Promise.all(
    features.map(
      async (name) =>
        (await stateProvider.getFeatureState(name)) ?? createFeatureState(name)
    )
  );
  await Promise.all(
    featureStates.map(async (featureState) =>
      stateProvider.setFeatureState(featureState)
    )
  );

  return featureStates;
}
