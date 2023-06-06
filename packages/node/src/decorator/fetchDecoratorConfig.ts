import { updateDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type FetchDecoratorConfigOptions } from '../hub/hubService'
import { logger } from '../global/logger'

export async function fetchDecoratorConfig (options: FetchDecoratorConfigOptions) {
  logger.info(`fetching config for ${JSON.stringify(options)}`)
  const response = await hubService.fetchDecoratorConfig(options)

  if (response !== null) {
    logger.info(`fetched decorator config ${JSON.stringify(response)}`)
    updateDecoratorConfig(options.decorator, response)
  }

  return response
}
