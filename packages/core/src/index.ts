import type { LocalStateProvider } from './models/LocalStateProvider'
import { type Metadata, metadataFromJSONString } from './models/Metadata'
import type { StanzaConfig } from './models/StanzaConfig'
import type { StanzaState } from './models/StanzaState'
import { FeatureStatus } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'

let stateProvider: LocalStateProvider

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
  stateProvider = (provider != null) ? provider : InMemoryLocalStateProvider

  // set initial state metadata if there is none

  if (stateProvider.GetMetadata() == null) {
    console.log('setting metadata')
    stateProvider.SetMetadata({
      Environment: config.Environment,
      StanzaCustomerId: config.StanzaCustomerId,
      Url: config.Url,
      LocalMode: config.LocalMode,
      Tags: new Map(((config.Tags != null) ? config.Tags : ['']).map(t => { return [t, new Date().toISOString()] }))
    })
  }

  if (config.LocalMode) {
    stateProvider.SetState({
      Features: (config.TestFeatures != null) ? config.TestFeatures : [],
      GlobalMessage: config.TestGlobalMessage
    })
  }
}

async function refreshState (): Promise<void> {
  if (stateProvider?.GetMetadata()?.LocalMode === true) {
    return
  };
  throw new Error('need to implement state fetch')
}

export { init, stateProvider, refreshState, FeatureStatus, metadataFromJSONString }
export type { Metadata, StanzaState, StanzaConfig, LocalStateProvider }
