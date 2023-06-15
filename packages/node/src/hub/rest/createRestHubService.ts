import { decoratorConfigResponse } from '../api/decoratorConfigResponse'
import { serviceConfigResponse } from '../api/serviceConfigResponse'
import { stanzaTokenLeaseResponse } from '../api/stanzaTokenLeaseResponse'
import { stanzaTokenResponse } from '../api/stanzaTokenResponse'
import { stanzaValidateTokenResponse } from '../api/stanzaValidateTokenResponse'
import { type HubService } from '../hubService'
import { stanzaMarkTokensAsConsumedResponse } from '../api/stanzaMarkTokensAsConsumedResponse'
import { type HubRequest } from '../hubRequest'
import { wrapHubServiceWithMetrics } from '../wrapHubServiceWithMetrics'
import { logger } from '../../global/logger'

interface HubServiceInitOptions {
  serviceName: string
  serviceRelease: string
  environment: string
  clientId: string
  hubRequest: HubRequest
}

export const createRestHubService = ({ serviceName, serviceRelease, environment, clientId, hubRequest }: HubServiceInitOptions): HubService => {
  return wrapHubServiceWithMetrics(logger.wrap({
    prefix: '[REST Hub Service] '
  }, {
    getServiceMetadata: () => ({ serviceName, environment, clientId }),
    fetchServiceConfig: async ({ lastVersionSeen } = {}) => {
      const serviceConfigResult = await hubRequest('v1/config/service', {
        body: {
          versionSeen: lastVersionSeen,
          service: {
            name: serviceName,
            release: serviceRelease,
            environment
          }
        },
        method: 'POST'
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
      const body = {
        versionSeen: lastVersionSeen,
        selector: {
          decoratorName: decorator,
          serviceName,
          serviceRelease,
          environment
        }
      }
      logger.debug('fetching decorator config with body %o', body)
      const decoratorConfigResult = await hubRequest('v1/config/decorator', {
        body,
        method: 'POST'
      }, decoratorConfigResponse)

      logger.debug('fetched decorator config result: %o', decoratorConfigResult)

      if (decoratorConfigResult === null || !decoratorConfigResult.configDataSent) {
        return null
      }

      return {
        config: decoratorConfigResult.config,
        version: decoratorConfigResult.version
      }
    },
    getToken: async ({ decorator, feature, priorityBoost, tags }) => {
      const body = {
        selector: {
          decoratorName: decorator,
          featureName: feature,
          environment,
          tags
        },
        clientId,
        priorityBoost
      }
      logger.debug('fetching token with body %o', body)
      return hubRequest('v1/quota/token', {
        method: 'POST',
        body
      }, stanzaTokenResponse)
    },
    getTokenLease: async ({ decorator, feature, priorityBoost, tags }) => {
      const body = {
        selector: {
          decoratorName: decorator,
          featureName: feature,
          environment,
          tags
        },
        clientId,
        priorityBoost
      }
      logger.debug('fetching token lease with body %o', body)
      const response = await hubRequest('v1/quota/lease', {
        method: 'POST',
        body
      }, stanzaTokenLeaseResponse)
      const now = Date.now()
      logger.debug('token leases granted: %o', response?.leases)
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
        body: {
          tokens: [{
            token,
            decorator
          }]
        }
      }, stanzaValidateTokenResponse)
      return response?.tokensValid?.[0] ?? null
    },
    markTokensAsConsumed: async ({ tokens }) => {
      const response = await hubRequest('v1/quota/consumed', {
        method: 'POST',
        body: {
          tokens
        }
      }, stanzaMarkTokensAsConsumedResponse)

      return response !== null ? { ok: true } : null
    }
  }))
}
