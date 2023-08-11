import { type StanzaGuardOptions } from './model'
import { startPollingGuardConfig } from './startPollingGuardConfig'
import { initDecoratorGuard } from './guard'
import { logger } from '../global/logger'
import { guardStore } from '../global/guardStore'

export const initOrGetGuard = (options: StanzaGuardOptions) => {
  logger.debug('initializing guard with options: %o', options)
  const decoratorGuard = initDecoratorGuard(options)
  if (guardStore.get(options.guard)?.initialized !== true) {
    guardStore.set(options.guard, {
      initialized: true
    })
    startPollingGuardConfig(options.guard)
  }

  return decoratorGuard
}
