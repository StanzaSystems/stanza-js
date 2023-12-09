import { init as globalsInit } from './globals';
import { type LocalStateProvider } from './models/localStateProvider';
import { type StanzaCoreConfig } from './models/stanzaCoreConfig';
import { startPollingFeatureStateUpdates } from './startPollingFeatureStateUpdates';
import { createInMemoryLocalStateProvider } from './utils/inMemoryLocalStateProvider';

export const init = async (
  config: StanzaCoreConfig,
  provider?: LocalStateProvider
): Promise<void> => {
  try {
    void new URL(config.url);
  } catch {
    throw new Error(`${config.url} is not a valid url`);
  }

  await globalsInit(config, provider ?? createInMemoryLocalStateProvider());

  const pollDelay = config.pollDelay ?? Promise.resolve();
  pollDelay.then(startPollingFeatureStateUpdates).catch((e) => {
    console.warn('Error while polling feature state updates', e);
  });
};
