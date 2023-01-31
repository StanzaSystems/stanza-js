import { type Metadata } from './Metadata'
import { type StanzaState } from './StanzaState'

export interface LocalStateProvider {
  SetMetadata: (metadata: Metadata) => void
  GetMetadata: () => Metadata | undefined
  SetState: (state: StanzaState, tag?: string) => void
  GetState: (tag?: string) => StanzaState | undefined
}
