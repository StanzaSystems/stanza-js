import { getStateProvider, init as globalsInit } from './globals';
import { type LocalStateProvider } from './models/localStateProvider';
import { type StanzaCoreConfig } from './models/stanzaCoreConfig';
import { startPollingFeatureStateUpdates } from './startPollingFeatureStateUpdates';
import { createInMemoryLocalStateProvider } from './utils/inMemoryLocalStateProvider';
import { type FeatureState } from './models/featureState';

export const init = (
  config: StanzaCoreConfig,
  provider?: LocalStateProvider
): void => {
  try {
    void new URL(config.url);
  } catch {
    throw new Error(`${config.url} is not a valid url`);
  }
  globalsInit(config, provider ?? createInMemoryLocalStateProvider());

  const pollDelay = config.pollDelay ?? Promise.resolve();
  pollDelay.then(startPollingFeatureStateUpdates).catch((e) => {
    console.warn('Error while polling feature state updates', e);
  });
};

export const initState = (featureStates: FeatureState[]) => {
  const provider = getStateProvider();

  featureStates.forEach((state) => {
    provider.setFeatureState(state);
  });
};
