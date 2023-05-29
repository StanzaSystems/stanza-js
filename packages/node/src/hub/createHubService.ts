import { decoratorConfigResponse } from './api/decoratorConfigResponse'
import { serviceConfigResponse } from './api/serviceConfigResponse'
import { stanzaTokenLeaseResponse } from './api/stanzaTokenLeaseResponse'
import { stanzaTokenResponse } from './api/stanzaTokenResponse'
import { stanzaValidateTokenResponse } from './api/stanzaValidateTokenResponse'
import { type HubService } from './hubService'
import { stanzaMarkTokensAsConsumedResponse } from './api/stanzaMarkTokensAsConsumedResponse'
import { type HubRequest } from './hubRequest'
import { wrapHubServiceWithMetrics } from './wrapHubServiceWithMetrics'

interface HubServiceInitOptions {
  serviceName: string
  serviceRelease: string
  environment: string
  clientId: string
  hubRequest: HubRequest
}

export const createHubService = ({ serviceName, serviceRelease, environment, clientId, hubRequest }: HubServiceInitOptions): HubService => {
  return wrapHubServiceWithMetrics(
    { serviceName, environment, clientId },
    {
      getServiceMetadata: () => ({ serviceName, environment, clientId }),
      fetchServiceConfig: async ({ lastVersionSeen } = {}) => {
        const serviceConfigResult = await hubRequest('v1/config/service', {
          searchParams: {
            'service.name': serviceName,
            'service.release': serviceRelease,
            'service.environment': environment,
            versionSeen: lastVersionSeen
          }
        }, serviceConfigResponse)

        if (serviceConfigResult === null || !serviceConfigResult.configDataSent) {
          return null
        }

        return {
          config: serviceConfigResult.config,
          version: serviceConfigResult.version
        }
      },
      fetchDecoratorConfig: async ({ decorator, lastVersionSeen }) => {
        const decoratorConfigResult = await hubRequest('v1/config/decorator', {
          searchParams: {
            's.decoratorName': decorator,
            's.serviceName': serviceName,
            's.serviceRelease': serviceRelease,
            's.environment': environment,
            versionSeen: lastVersionSeen
          }
        }, decoratorConfigResponse)

        if (decoratorConfigResult === null || !decoratorConfigResult.configDataSent) {
          return null
        }

        return {
          config: decoratorConfigResult.config,
          version: decoratorConfigResult.version
        }
      },
      getToken: async ({ decorator, feature, priorityBoost }) => {
        return hubRequest('v1/quota/token', {
          method: 'POST',
          searchParams: {
            's.decoratorName': decorator,
            's.featureName': feature,
            's.environment': environment,
            clientId,
            priorityBoost: priorityBoost?.toFixed(0)
          }
        }, stanzaTokenResponse)
      },
      getTokenLease: async ({ decorator, feature, priorityBoost }) => {
        const response = await hubRequest('v1/quota/lease', {
          method: 'POST',
          searchParams: {
            's.decoratorName': decorator,
            's.featureName': feature,
            's.environment': environment,
            clientId,
            priorityBoost: priorityBoost?.toFixed(0)
          }
        }, stanzaTokenLeaseResponse)
        const now = Date.now()

        if (response?.leases === undefined) {
          return null
        }

        if (response.leases.length === 0) {
          return { granted: false }
        }

        return {
          granted: true,
          leases: response.leases.map(lease => ({
            token: lease.token,
            feature: lease.feature,
            priorityBoost: lease.priorityBoost,
            expiresAt: now + lease.durationMsec
          }))
        }
      },
      validateToken: async ({ token, decorator }) => {
        const response = await hubRequest('v1/quota/validatetoken', {
          method: 'POST',
          body: [{
            token,
            decorator
          }]
        }, stanzaValidateTokenResponse)
        return response?.tokensValid?.[0] ?? null
      },
      markTokensAsConsumed: async ({ tokens }) => {
        const response = await hubRequest('v1/quota/consumed', {
          method: 'POST',
          searchParams: {
            token: tokens
          }
        }, stanzaMarkTokensAsConsumedResponse)

        return response !== null ? { ok: true } : null
      }
    })
}
