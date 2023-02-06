import { type LocalStateProvider } from '../models/LocalStateProvider'
import { type StanzaState } from '../models/StanzaState'

const localState = new Map<string, StanzaState>()

function setState (state: StanzaState, page?: string): void {
  page = page ?? ''
  localState.set(page, state)
}

function getState (page?: string): StanzaState | undefined {
  return localState.get(page ?? '')
}

const provider: LocalStateProvider = {
  GetState: getState,
  SetState: setState
}

export default provider
