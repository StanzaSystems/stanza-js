// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../index.d.ts"/>
import { Stanza, type StanzaConfig } from 'stanza-core'
import startBackgroundContextUpdates from './ContextManager'
import localState from './localStorageStateProvider'

export const init = (initialConfig: StanzaConfig): void => {
  Stanza.init(initialConfig, localState)
  void startBackgroundContextUpdates()
}

export const getContextHot = Stanza.getContextHot
export const getContextStale = Stanza.getContextStale
export const getContext = Stanza.getContext

export default { init, getContextHot, getContextStale, getContext }
export type { StanzaConfig }
