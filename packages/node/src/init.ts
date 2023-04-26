import { initOrThrow } from './initOrThrow'
import { type StanzaInitOptions } from './stanzaInitOptions'

export const init = async (options: Partial<StanzaInitOptions> = {}) => {
  try {
    await initOrThrow(options)
  } catch (e) {
    if (e instanceof TypeError) {
      console.warn(e.message)
    } else {
      console.warn('Failed to init the Stanza SDK:', e instanceof Error ? e.message : e)
    }
  }
}
