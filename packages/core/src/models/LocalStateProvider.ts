import { type StanzaState } from './StanzaState'

export interface LocalStateProvider {
  SetState: (state: StanzaState, page?: string) => void
  GetState: (page?: string) => StanzaState | undefined
}
