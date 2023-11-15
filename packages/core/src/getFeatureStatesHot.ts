import { getStateProvider } from './globals';
import { type FeatureState } from './models/featureState';
import { fetchFeatureStates } from './utils/fetchFeatureStates';

export async function getFeatureStatesHot(
  features: string[]
): Promise<FeatureState[]> {
  const featureStates = await fetchFeatureStates(features);
  const stateProvider = getStateProvider();
  await Promise.all(
    featureStates.map(async (featureState) => {
      await stateProvider.setFeatureState(featureState);
    })
  );

  return featureStates;
}
