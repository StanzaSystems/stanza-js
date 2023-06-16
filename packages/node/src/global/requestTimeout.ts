import { createGlobal } from './createGlobal'

export let STANZA_REQUEST_TIMEOUT = createGlobal(Symbol.for('[Stanza SDK Internal] Request timeout'), () => 1000)

export const setRequestTimeout = (timeout: number) => {
  STANZA_REQUEST_TIMEOUT = timeout
}
