import { type HubService } from './hubService'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { events, messageBus } from '../global/messageBus'

interface HubServiceMetricsOptions {
  serviceName: string
  environment: string
  clientId: string
}

export function wrapHubServiceWithMetrics ({ serviceName, environment, clientId }: HubServiceMetricsOptions, hubService: HubService): HubService {
  return {
    ...hubService,
    fetchServiceConfig: wrapEventsAsync(hubService.fetchServiceConfig, {
      success: () => {
        void messageBus.emit(events.config.service.fetchOk, {
          serviceName,
          clientId,
          environment
        })
      },
      failure: () => {
        void messageBus.emit(events.config.service.fetchFailed, {
          serviceName,
          clientId,
          environment
        })
      },
      latency: (latency) => {
        void messageBus.emit(events.config.service.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment
        })
      }
    }),
    fetchDecoratorConfig: wrapEventsAsync(hubService.fetchDecoratorConfig, {
      success: (_, { decorator }) => {
        void messageBus.emit(events.config.decorator.fetchOk, {
          decorator,
          serviceName,
          clientId,
          environment
        })
      },
      failure: (_, { decorator }) => {
        void messageBus.emit(events.config.decorator.fetchFailed, {
          decorator,
          serviceName,
          clientId,
          environment
        })
      },
      latency: (latency, { decorator }) => {
        void messageBus.emit(events.config.decorator.fetchLatency, {
          decorator,
          latency,
          serviceName,
          clientId,
          environment
        })
      }
    }),
    getToken: wrapEventsAsync(hubService.getToken),
    getTokenLease: wrapEventsAsync(hubService.getTokenLease),
    validateToken: wrapEventsAsync(hubService.validateToken),
    markTokensAsConsumed: wrapEventsAsync(hubService.markTokensAsConsumed)
  }
}
