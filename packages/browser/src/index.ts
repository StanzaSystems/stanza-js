// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../index.d.ts"/>
import { init, type StanzaConfig, type StanzaState } from 'stanza-core'
import localState from './localStorageStateProvider'
import StanzaWorker from './stanzaWorker?worker&inline'

// import { createWorker } from './utils/workerUtils'

let stanzaUpdater: Worker
let state: StanzaState | undefined
if (typeof window !== 'undefined') {
  stanzaUpdater = new StanzaWorker()
}
const initBrowser = (initialConfig: StanzaConfig, worker?: Worker | undefined): StanzaState | undefined => {
  init(initialConfig, localState)
  if (worker !== undefined) {
    stanzaUpdater = worker
  }
  state = localState.GetState()
  stanzaUpdater.postMessage('initialize')
  return state
}

export { initBrowser as init, state }
