import type { LocalStateProvider } from './models/LocalStateProvider'
import type { Metadata } from './models/Metadata'
import type { StanzaConfig } from './models/StanzaConfig'
import type { StanzaState } from './models/StanzaState'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'

let stateProvider: LocalStateProvider

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
//   if (config.LocalMode && !((config.TestFeatures != null) || (config?.TestGlobalMessage))) {
//     throw new Error('You must configure test features or error to work in local mode')
//   }

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

export { init, stateProvider, refreshState }
export type { Metadata, StanzaState, StanzaConfig, LocalStateProvider }
