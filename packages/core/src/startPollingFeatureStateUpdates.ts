import { getFeatureStatesHot } from './getFeatureStatesHot';
import { featureChanges, getConfig, getStateProvider } from './globals';

export async function startPollingFeatureStateUpdates(): Promise<void> {
  const stateProvider = getStateProvider();
  stateProvider.addChangeListener(({ newValue }) => {
    featureChanges.dispatchChange(newValue);
  });

  while (true) {
    await pollFeatureStateUpdates();
    await poll();
  }
}

async function pollFeatureStateUpdates(): Promise<void> {
  const provider = getStateProvider();

  const featureStates = await provider.getAllFeatureStates();
  const features = featureStates.map(({ featureName }) => featureName);
  await getFeatureStatesHot(features);
}

async function poll(): Promise<void> {
  const config = getConfig();
  const timeout = (config.refreshSeconds ?? 10) * 1000;
  await new Promise((resolve) => setTimeout(resolve, timeout));
}
