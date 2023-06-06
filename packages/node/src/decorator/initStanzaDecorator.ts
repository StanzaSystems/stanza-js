import { type StanzaDecoratorOptions } from './model'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'
import { initDecoratorGuard } from './guard'
import { logger } from '../global/logger'

export const initDecorator = (options: StanzaDecoratorOptions) => {
  logger.info('intializing decorator with options', options)
  startPollingDecoratorConfig(options.decorator)

  return initDecoratorGuard(options)
}
