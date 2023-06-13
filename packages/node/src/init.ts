import { initOrThrow } from './initOrThrow'
import { type StanzaInitOptions } from './stanzaInitOptions'
import { logger } from './global/logger'

export const init = async (options: Partial<StanzaInitOptions> = {}) => {
  try {
    await initOrThrow(options)
  } catch (e) {
    if (e instanceof TypeError) {
      logger.warn(e.message)
    } else {
      logger.warn('Failed to init the Stanza SDK:' + (e instanceof Error ? e.message : JSON.stringify(e)))
    }
  }
  logger.info('Stanza initialized')
}
