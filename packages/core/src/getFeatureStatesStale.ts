import { getStateProvider } from './globals';
import { createFeatureState } from './models/createFeatureState';
import { type FeatureState } from './models/featureState';

export async function getFeatureStatesStale(
  features: string[]
): Promise<FeatureState[]> {
  const stateProvider = getStateProvider();
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
