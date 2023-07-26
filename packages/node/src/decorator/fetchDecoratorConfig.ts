import { updateDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type FetchDecoratorConfigOptions } from '../hub/hubService'
import { logger } from '../global/logger'

export async function fetchDecoratorConfig (options: FetchDecoratorConfigOptions) {
  logger.debug('fetching config for %o', options)
  const response = await hubService.fetchDecoratorConfig(options)

  if (response !== null) {
    logger.debug('fetched decorator config %o', response)
    updateDecoratorConfig(options.decorator, response)
  }

  return response
}
