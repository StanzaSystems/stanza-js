import { fetchServiceConfig } from './fetchServiceConfig'
import { type ServiceConfig } from '../hub/model'
import { startPolling } from '../utils/startPolling'

export const startPollingServiceConfig = () => {
  startPolling(async (prevResult: ServiceConfig | null) => fetchServiceConfig(prevResult?.version !== undefined
    ? {
        lastVersionSeen: prevResult.version
      }
    : undefined), { pollInterval: 15000 })
}
