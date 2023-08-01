import { type HubService } from './hubService'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { eventBus, events } from '../global/eventBus'
import { getServiceConfig } from '../global/serviceConfig'

export function wrapHubServiceWithMetrics (hubService: HubService): HubService {
  const { serviceName, environment, clientId } = hubService.getServiceMetadata()

  return {
    ...hubService,
    fetchServiceConfig: wrapEventsAsync(hubService.fetchServiceConfig, {
      success: async (data) => {
        return eventBus.emit(events.config.service.fetchOk, {
          serviceName,
          clientId,
          environment,
          customerId: data?.config.customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.config.service.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.config.service.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId
        })
      }
    }),
    fetchDecoratorConfig: wrapEventsAsync(hubService.fetchDecoratorConfig, {
      success: async (_, { decorator }) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.config.decorator.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment,
          customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.config.decorator.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.config.decorator.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId
        })
      }
    }),
    getToken: wrapEventsAsync(hubService.getToken, {
      success: async (_, { decorator }) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken'
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken'
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken'
        })
      }
    }),
    getTokenLease: wrapEventsAsync(hubService.getTokenLease, {
      success: async (_, { decorator }) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchOk, {
          decoratorName: decorator,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease'
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease'
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease'
        })
      }
    }),
    validateToken: wrapEventsAsync(hubService.validateToken, {
      success: async (result, { decorator }) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(
          result?.valid === true
            ? events.quota.validateOk
            : events.quota.validateFailed,
          {
            decoratorName: decorator,
            serviceName,
            clientId,
            environment,
            customerId
          })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.validateFailed, {
          serviceName,
          clientId,
          environment,
          customerId
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.validateLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId
        })
      }
    }),
    markTokensAsConsumed: wrapEventsAsync(hubService.markTokensAsConsumed, {
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchOk, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed'
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed'
        })
      },
      latency: async (latency) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.quota.fetchLatency, {
          latency,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed'
        })
      }
    })
  }
}
