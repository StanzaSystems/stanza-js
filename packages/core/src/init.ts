import { init as globalsInit } from './globals';
import { type LocalStateProvider } from './models/localStateProvider';
import { type StanzaCoreConfig } from './models/stanzaCoreConfig';
import { startPollingFeatureStateUpdates } from './startPollingFeatureStateUpdates';
import { createInMemoryAsyncLocalStateProvider } from './utils/inMemoryAsyncLocalStateProvider';

// export const init = (
//   config: StanzaCoreConfig,
//   provider?: LocalStateProvider
// ): void => {
//   try {
//     void new URL(config.url);
//   } catch {
//     throw new Error(`${config.url} is not a valid url`);
//   }

//   globalsInit(config, provider ?? createInMemoryLocalStateProvider());

//   const pollDelay = config.pollDelay ?? Promise.resolve();
//   pollDelay.then(startPollingFeatureStateUpdates).catch((e) => {
//     console.warn('Error while polling feature state updates', e);
//   });
// };

export const init = async (
  config: StanzaCoreConfig,
  provider?: LocalStateProvider
): Promise<void> => {
  try {
    void new URL(config.url);
  } catch {
    throw new Error(`${config.url} is not a valid url`);
  }

  // Provider is optional, if not provided, use in memory provider
  // if config.isReactNative is true, use async storage provider

  // const isReactNative = config.isReactNative ?? false;

  // if (!isReactNative) {
  //   throw new Error('initMobile can only be used for react-native');
  // }

  await globalsInit(
    config,
    provider ?? createInMemoryAsyncLocalStateProvider()
  );

  const pollDelay = config.pollDelay ?? Promise.resolve();
  pollDelay.then(startPollingFeatureStateUpdates).catch((e) => {
    console.warn('Error while polling feature state updates', e);
  });
};
