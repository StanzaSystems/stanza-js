import { type StanzaState } from './StanzaState'

export interface LocalStateProvider {
  SetState: (state: StanzaState, group?: string) => void
  GetState: (group?: string) => StanzaState | undefined
}
