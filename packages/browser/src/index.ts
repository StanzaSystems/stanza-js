// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../index.d.ts"/>
import Stanza, { type StanzaConfig, type StanzaState } from 'stanza-core'
import localState from './localStorageStateProvider'
import StanzaWorker from './stanzaWorker?worker&inline'

// import { createWorker } from './utils/workerUtils'

let stanzaUpdater: Worker
let state: StanzaState | undefined
if (typeof window !== 'undefined') {
  stanzaUpdater = new StanzaWorker()
}
const init = (initialConfig: StanzaConfig, worker?: Worker | undefined): StanzaState | undefined => {
  Stanza.init(initialConfig, localState)
  if (worker !== undefined) {
    stanzaUpdater = worker
  }
  stanzaUpdater.onmessage = onWorkerMessage
  state = localState.GetState()
  stanzaUpdater.postMessage({ type: 'initialize', config: initialConfig })
  return state
}

const onWorkerMessage = (ev: MessageEvent): void => {
  Stanza.saveGroupState(ev.data.data.state)
}

const getGroupStateHot = Stanza.getGroupStateHot
const getGroupState = Stanza.getGroupState

export default { init, getGroupStateHot, getGroupState }
