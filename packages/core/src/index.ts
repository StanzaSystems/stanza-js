import { getFeatureStates } from './getFeatureStates'
import { getFeatureStatesHot } from './getFeatureStatesHot'
import { getFeatureStatesStale } from './getFeatureStatesStale'
import * as globals from './globals'
import { init } from './init'

export { ActionCode } from './models/Feature'
export type { FeatureState } from './models/featureState'
export type { LocalStateProvider } from './models/localStateProvider'
export type { StanzaCoreConfig } from './models/StanzaCoreConfig'

export const utils = {
  globals
}

export const Stanza = {
  init, getFeatureStatesHot, getFeatureStatesStale, getFeatureStates
}
