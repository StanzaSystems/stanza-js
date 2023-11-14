import { updateGuardConfig } from '../global/guardConfig'
import { hubService } from '../global/hubService'
import { type FetchGuardConfigOptions } from '../hub/hubService'
import { logger } from '../global/logger'

export async function fetchGuardConfig(options: FetchGuardConfigOptions) {
  logger.debug('fetching config for %o', options)
  const response = await hubService.fetchGuardConfig(options)

  if (response !== null) {
    logger.debug('fetched guard config %o', response)
    updateGuardConfig(options.guard, response)
  }

  return response
}
