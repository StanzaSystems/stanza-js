import { type LocalStateProvider } from '../models/LocalStateProvider'
import { type Metadata } from '../models/Metadata'
import { type StanzaState } from '../models/StanzaState'

const localState = new Map<string, StanzaState>()
let localMetadata: Metadata

function setState (state: StanzaState, tag?: string): void {
  tag = tag ?? ''
  localState.set(tag, state)
  localMetadata.Tags.set(tag, new Date().toISOString())
}

function getState (tag?: string): StanzaState | undefined {
  return localState.get(tag ?? '')
}

function setMetadata (metadata: Metadata): void {
  localMetadata = metadata
}

function getMetadata (): Metadata {
  return localMetadata
}

const provider: LocalStateProvider = {
  GetMetadata: getMetadata,
  SetMetadata: setMetadata,
  GetState: getState,
  SetState: setState
}

export default provider
