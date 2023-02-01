import { type Metadata, type StanzaState, type LocalStateProvider, metadataFromJSONString } from 'stanza-core'

function setState (state: StanzaState, tag?: string): void {
  tag = tag ?? ''
  window.localStorage.setItem(`stanza_${tag}`, JSON.stringify(state))
  const metadata = getMetadata()
  if (metadata === undefined) {
    throw new Error('attempt to set state without state metadata')
  }
  metadata.Tags.set(tag, new Date().toISOString())
  setMetadata(metadata)
}

function getState (tag?: string): StanzaState {
  const state = window.localStorage.getItem(`stanza_${tag ?? ''}`)
  if (state === null) {
    throw new Error(`stanza state for ${tag ?? 'default'} not found`)
  }
  return JSON.parse(state) as StanzaState
}

function setMetadata (metadata: Metadata): void {
  window.localStorage.setItem('stanza_metadata', JSON.stringify(metadata))
}

function getMetadata (): Metadata | undefined {
  const meta = window.localStorage.getItem('stanza_metadata')
  if (meta === null) {
    return undefined
  }

  return metadataFromJSONString(meta)
}

const provider: LocalStateProvider = {
  GetMetadata: getMetadata,
  SetMetadata: setMetadata,
  GetState: getState,
  SetState: setState
}

export default provider
