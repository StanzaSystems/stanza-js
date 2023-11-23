import { getFeatureStatesHot } from './getFeatureStatesHot';
import { featureChanges, getConfig, getStateProvider } from './globals';
import {
  type LocalStateProvider,
  type AsyncLocalStateProvider,
} from './models/localStateProvider';

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
  if (provider.getAllFeatureStates() instanceof Promise) {
    const featureStates = await (
      provider as AsyncLocalStateProvider
    ).getAllFeatureStates();
    const features = featureStates.map(({ featureName }) => featureName);
    await getFeatureStatesHot(features);
  } else {
    const featureStates = (
      provider as LocalStateProvider
    ).getAllFeatureStates();
    const features = featureStates.map(({ featureName }) => featureName);
    await getFeatureStatesHot(features);
  }
}

async function poll(): Promise<void> {
  const config = getConfig();
  const timeout = (config.refreshSeconds ?? 10) * 1000;
  await new Promise((resolve) => setTimeout(resolve, timeout));
}
