import { type LocalStateProvider } from '../models/LocalStateProvider'
import { type StanzaState } from '../models/StanzaState'

const localState = new Map<string, StanzaState>()

function setState (state: StanzaState, group?: string): void {
  group = group ?? ''
  localState.set(group, state)
}

function getState (group?: string): StanzaState | undefined {
  return localState.get(group ?? '')
}

const provider: LocalStateProvider = {
  GetState: getState,
  SetState: setState
}

export default provider
