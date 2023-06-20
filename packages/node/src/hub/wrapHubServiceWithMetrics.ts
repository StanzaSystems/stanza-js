import { type HubService } from './hubService'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { eventBus, events } from '../global/eventBus'

export function wrapHubServiceWithMetrics (hubService: HubService): HubService {
  const { serviceName, environment, clientId } = hubService.getServiceMetadata()

  return {
    ...hubService,
    fetchServiceConfig: wrapEventsAsync(hubService.fetchServiceConfig, {
      success: async () => {
        return eventBus.emit(events.config.service.fetchOk, {
          serviceName,
          clientId,
          environment
        })
      },
      failure: async () => {
        return eventBus.emit(events.config.service.fetchFailed, {
          serviceName,
          clientId,
          environment
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.config.service.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment
        })
      }
    }),
    fetchDecoratorConfig: wrapEventsAsync(hubService.fetchDecoratorConfig, {
      success: async (_, { decorator }) => {
        return eventBus.emit(events.config.decorator.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment
        })
      },
      failure: async () => {
        return eventBus.emit(events.config.decorator.fetchFailed, {
          serviceName,
          clientId,
          environment
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.config.decorator.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment
        })
      }
    }),
    getToken: wrapEventsAsync(hubService.getToken, {
      success: async (_, { decorator }) => {
        return eventBus.emit(events.quota.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment,
          endpoint: 'GetToken'
        })
      },
      failure: async () => {
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          endpoint: 'GetToken'
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          endpoint: 'GetToken'
        })
      }
    }),
    getTokenLease: wrapEventsAsync(hubService.getTokenLease, {
      success: async (_, { decorator }) => {
        return eventBus.emit(events.quota.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment,
          endpoint: 'GetTokenLease'
        })
      },
      failure: async () => {
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          endpoint: 'GetTokenLease'
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          endpoint: 'GetTokenLease'
        })
      }
    }),
    validateToken: wrapEventsAsync(hubService.validateToken, {
      success: async (result, { decorator }) => {
        return eventBus.emit(
          result?.valid === true
            ? events.quota.validateOk
            : events.quota.validateFailed,
          {
            decoratorName: decorator,
            serviceName,
            clientId,
            environment
          })
      },
      failure: async () => {
        return eventBus.emit(events.quota.validateFailed, {
          serviceName,
          clientId,
          environment
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.quota.validateLatency, {
          latency,
          serviceName,
          clientId,
          environment
        })
      }
    }),
    markTokensAsConsumed: wrapEventsAsync(hubService.markTokensAsConsumed, {
      success: async () => {
        return eventBus.emit(events.quota.fetchOk, {
          serviceName,
          clientId,
          environment,
          endpoint: 'SetTokenLeaseConsumed'
        })
      },
      failure: async () => {
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          endpoint: 'SetTokenLeaseConsumed'
        })
      },
      latency: async (latency) => {
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          endpoint: 'SetTokenLeaseConsumed'
        })
      }
    })
  }
}
