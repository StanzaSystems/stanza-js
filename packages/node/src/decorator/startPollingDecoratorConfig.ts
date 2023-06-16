import { type DecoratorConfig } from '../hub/model'
import { startPolling } from '../utils/startPolling'
import { fetchDecoratorConfig } from './fetchDecoratorConfig'
import { logger } from '../global/logger'

export const startPollingDecoratorConfig = (decorator: string) => {
  logger.debug('start polling decorator config for \'%s\' decorator', decorator)
  startPolling(async (prevResult: DecoratorConfig | null) => fetchDecoratorConfig({
    decorator,
    lastVersionSeen: prevResult?.version
  }), { pollInterval: 15000 })
}
