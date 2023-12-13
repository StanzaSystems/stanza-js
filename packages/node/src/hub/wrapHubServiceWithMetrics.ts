import { type HubService } from '@getstanza/hub-client-api';
import { wrapEventsAsync } from '../utils/wrapEventsAsync';
import { eventBus, events } from '../global/eventBus';
import { getServiceConfig } from '../global/serviceConfig';

export function wrapHubServiceWithMetrics(hubService: HubService): HubService {
  return {
    ...hubService,
    fetchServiceConfig: wrapEventsAsync(hubService.fetchServiceConfig, {
      success: async (data) => {
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.service.fetchOk, {
          serviceName,
          clientId,
          environment,
          customerId: data?.config.customerId,
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.service.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
      duration: async (duration, result) => {
        const customerId =
          result?.config.customerId ?? getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.service.fetchDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
    }),
    fetchGuardConfig: wrapEventsAsync(hubService.fetchGuardConfig, {
      success: async (_, { guard }) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.guard.fetchOk, {
          guardName: guard,
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.guard.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
      duration: async (duration) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.config.guard.fetchDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
    }),
    getToken: wrapEventsAsync(hubService.getToken, {
      success: async (_, { guard }) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchOk, {
          guardName: guard,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken',
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken',
        });
      },
      duration: async (duration) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetToken',
        });
      },
    }),
    getTokenLease: wrapEventsAsync(hubService.getTokenLease, {
      success: async (_, { guard }) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchOk, {
          guardName: guard,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease',
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease',
        });
      },
      duration: async (duration) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'GetTokenLease',
        });
      },
    }),
    validateToken: wrapEventsAsync(hubService.validateToken, {
      success: async (result, { guard }) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(
          result?.valid === true
            ? events.quota.validateOk
            : events.quota.validateFailed,
          {
            guardName: guard,
            serviceName,
            clientId,
            environment,
            customerId,
          }
        );
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.validateFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
      duration: async (duration) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.validateDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
        });
      },
    }),
    markTokensAsConsumed: wrapEventsAsync(hubService.markTokensAsConsumed, {
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchOk, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed',
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchFailed, {
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed',
        });
      },
      duration: async (duration) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.quota.fetchDuration, {
          duration,
          serviceName,
          clientId,
          environment,
          customerId,
          endpoint: 'SetTokenLeaseConsumed',
        });
      },
    }),
  };
}
