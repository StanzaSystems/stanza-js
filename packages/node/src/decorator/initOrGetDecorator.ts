import { type StanzaDecoratorOptions } from './model'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'
import { initDecoratorGuard } from './guard'
import { logger } from '../global/logger'
import { decoratorStore } from '../global/decoratorStore'

export const initOrGetDecorator = (options: StanzaDecoratorOptions) => {
  logger.debug('initializing decorator with options: %o', options)
  const decoratorGuard = initDecoratorGuard(options)
  if (decoratorStore.get(options.decorator)?.initialized !== true) {
    decoratorStore.set(options.decorator, {
      initialized: true
    })
    startPollingDecoratorConfig(options.decorator)
  }

  return decoratorGuard
}
