import { init, type StanzaConfig, type StanzaState } from 'stanza-core'
import localState from './localStorageStateProvider'

let stanzaUpdater: Worker
let state: StanzaState | undefined
if (typeof window !== 'undefined') {
  stanzaUpdater = new Worker(new URL('./featureWorker.ts', import.meta.url))
}
const initBrowser = (initialConfig: StanzaConfig): void => {
  init(initialConfig, localState)
  state = localState.GetState()
  stanzaUpdater.postMessage('initialize')
}

export { initBrowser as init, state }
