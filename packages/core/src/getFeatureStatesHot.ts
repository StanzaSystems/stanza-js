import { getStateProvider } from './globals';
import { type FeatureState } from './models/featureState';
import {
  type AsyncLocalStateProvider,
  type LocalStateProvider,
} from './models/localStateProvider';
import { fetchFeatureStates } from './utils/fetchFeatureStates';

export async function getFeatureStatesHot(
  features: string[]
): Promise<FeatureState[]> {
  const featureStates = await fetchFeatureStates(features);
  const stateProvider = getStateProvider();

  featureStates.forEach((featureState) => {
    (stateProvider as LocalStateProvider).setFeatureState(featureState);
  });

  return featureStates;
}

export async function getFeatureStatesHotAsync(
  features: string[]
): Promise<FeatureState[]> {
  const featureStates = await fetchFeatureStates(features);
  const stateProvider = getStateProvider() as AsyncLocalStateProvider;
  await Promise.all(
    featureStates.map(async (featureState) =>
      stateProvider.setFeatureState(featureState)
    )
  );
  return featureStates;
}
