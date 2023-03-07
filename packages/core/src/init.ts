import { init as globalsInit } from './globals'
import { type LocalStateProvider } from './models/localStateProvider'
import { type StanzaCoreConfig } from './models/StanzaCoreConfig'
import { pollFeatureStateUpdates } from './pollFeatureStateUpdates'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'

export const init = (config: StanzaCoreConfig, provider?: LocalStateProvider): void => {
  try {
    void new URL(config.url)
  } catch {
    throw new Error(`${config.url} is not a valid url`)
  }
  globalsInit(config, provider ?? InMemoryLocalStateProvider)

  const pollDelay = config.pollDelay ?? Promise.resolve()
  void pollDelay.then(pollFeatureStateUpdates)
}
