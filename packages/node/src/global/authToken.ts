import { createGlobalState } from './createGlobalState'

export let {
  currentValue: STANZA_AUTH_TOKEN,
  update: updateAuthToken
} = createGlobalState(Symbol.for('[Stanza SDK Internal] Auth bearer token'), (): string | null => null)

export const updateStanzaAuthToken = (newValue: string) => {
  STANZA_AUTH_TOKEN = updateAuthToken(newValue)
}
