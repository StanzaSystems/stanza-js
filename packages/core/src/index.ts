import type { LocalStateProvider } from './models/LocalStateProvider'
import type { StanzaConfig } from './models/StanzaConfig'
import { type StanzaState } from './models/StanzaState'
import { FeatureStatus } from './models/Feature'
import InMemoryLocalStateProvider from './utils/InMemoryLocalStateProvider'
import { getRefreshStateForFeatures } from './utils/StanzaService'

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

function saveGroupState (groupState: StanzaState): void {
  const FeatureGroup = stanzaConfig.FeatureGroups.find((e) => { return e.Name === groupState.Group })
  if (FeatureGroup === null || FeatureGroup === undefined) {
    throw new Error(`configuration for group ${groupState.Group} not found`)
  }
  stateProvider.SetState(groupState, groupState.Group)
}

function getGroupState (group: string): StanzaState {
  const state = stateProvider.GetState(group)
  if (state === undefined) {
    throw new Error(`State for group ${group} is not found. Is it configured?`)
  }
  return state
}

export { init, saveGroupState, getGroupState, getRefreshStateForFeatures, FeatureStatus }
export type { StanzaState, StanzaConfig, LocalStateProvider }
