import type { LocalStateProvider } from './models/LocalStateProvider'
import type { StanzaConfig } from './models/StanzaConfig'
import { createStanzaState, type StanzaState } from './models/StanzaState'
import { type Feature, FeatureStatus } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'

let stateProvider: LocalStateProvider
let stanzaConfig: StanzaConfig

const init = (config: StanzaConfig, provider?: LocalStateProvider): void => {
  if (stanzaConfig !== undefined || stateProvider !== undefined) {
    throw new Error('Stanza already initialized')
  }
  stateProvider = (provider != null) ? provider : InMemoryLocalStateProvider
  stanzaConfig = config
}

async function getRefreshStateForPageFeatures (page: string): Promise<StanzaState> {
  interface JSONResponse {
    data?: {
      features: Feature[]
    }
  }
  const params = new URLSearchParams()
  stanzaConfig.PageFeatures.get(page)?.forEach(s => { params.append('feature', s) })
  const response = await fetch(`${stanzaConfig.Url}/featureStatus?${params.toString()}`, {
    headers: {
      'x-stanza-customer-id': stanzaConfig.StanzaCustomerId
    }
  })
  const { data }: JSONResponse = await response.json()
  return createStanzaState(data?.features ?? [], page)
}

function savePageState (pageState: StanzaState): void {
  const pageConfig = stanzaConfig.PageFeatures.get(pageState.Page)
  if (pageConfig === null || pageConfig === undefined) {
    throw new Error(`configruation for page ${pageState.Page} not found`)
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

export { init, getRefreshStateForPageFeatures, savePageState, getPageState, FeatureStatus, stanzaConfig }
export type { StanzaState, StanzaConfig, LocalStateProvider }
