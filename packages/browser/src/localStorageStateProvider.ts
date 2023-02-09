import { type StanzaState, type LocalStateProvider } from 'stanza-core'

function setState (state: StanzaState, tag?: string): void {
  tag = tag ?? ''
  window.localStorage.setItem(`stanza_${tag}`, JSON.stringify(state))
}

function getState (tag?: string): StanzaState {
  const state = window.localStorage.getItem(`stanza_${tag ?? ''}`)
  if (state === null) {
    throw new Error(`stanza state for ${tag ?? 'default'} not found`)
  }
  return JSON.parse(state) as StanzaState
}

const provider: LocalStateProvider = {
  GetState: getState,
  SetState: setState
}

export default provider
