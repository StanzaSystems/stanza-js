import { fetchServiceConfig } from './fetchServiceConfig'
import { type ServiceConfig } from '../hub/model'
import { startPolling } from '../utils/startPolling'
import { logger } from '../global/logger'

export const startPollingServiceConfig = () => {
  logger.debug('start polling service config')
  startPolling(async (prevResult: ServiceConfig | null) => fetchServiceConfig(prevResult?.version !== undefined
    ? {
        lastVersionSeen: prevResult.version
      }
    : undefined), { pollInterval: 15000 })
}
