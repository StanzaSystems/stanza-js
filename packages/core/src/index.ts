import type { LocalStateProvider } from './models/LocalStateProvider'
import type { StanzaConfig } from './models/StanzaConfig'
import { type StanzaState } from './models/StanzaState'
import { FeatureStatus } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'
import { getRefreshStateForPageFeatures } from './utils/StanzaService'

let stateProvider: LocalStateProvider
let stanzaConfig: StanzaConfig

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
  if (stanzaConfig !== undefined || stateProvider !== undefined) {
    throw new Error('Stanza already initialized')
  }
  try {
    // eslint-disable-next-line no-new
    new URL(config.Url)
  } catch {
    throw new Error(`${config.Url} is not a valid url`)
  }
  stateProvider = (provider != null) ? provider : InMemoryLocalStateProvider
  stanzaConfig = config
}

function savePageState (pageState: StanzaState): void {
  const pageConfig = stanzaConfig.PageConfigs.find((e) => { return e.Name === pageState.Page })
  if (pageConfig === null || pageConfig === undefined) {
    throw new Error(`configuration for page ${pageState.Page} not found`)
  }
  stateProvider.SetState(pageState, pageState.Page)
}

function getPageState (page: string): StanzaState {
  const state = stateProvider.GetState(page)
  if (state === undefined) {
    throw new Error(`State for page ${page} is not found. Is it configured?`)
  }
  return state
}

export { init, savePageState, getPageState, getRefreshStateForPageFeatures, FeatureStatus }
export type { StanzaState, StanzaConfig, LocalStateProvider }
