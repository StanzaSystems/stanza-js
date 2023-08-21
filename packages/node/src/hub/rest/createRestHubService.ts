import { guardConfigResponse } from '../api/guardConfigResponse'
import { serviceConfigResponse } from '../api/serviceConfigResponse'
import { stanzaTokenLeaseResponse } from '../api/stanzaTokenLeaseResponse'
import { stanzaTokenResponse } from '../api/stanzaTokenResponse'
import { stanzaValidateTokenResponse } from '../api/stanzaValidateTokenResponse'
import { type HubService } from '../hubService'
import { stanzaMarkTokensAsConsumedResponse } from '../api/stanzaMarkTokensAsConsumedResponse'
import { type HubRequest } from '../hubRequest'
import { wrapHubServiceWithMetrics } from '../wrapHubServiceWithMetrics'
import { logger } from '../../global/logger'
import { stanzaAuthTokenResponse } from '../api/stanzaAuthTokenResponse'

interface HubServiceInitOptions {
  serviceName: string
  serviceRelease: string
  environment: string
  clientId: string
  hubRequest: HubRequest
}

export const createRestHubService = ({ serviceName, serviceRelease, environment, clientId, hubRequest }: HubServiceInitOptions): HubService => {
  return wrapHubServiceWithMetrics(logger.wrap({
    prefix: '[REST Hub Service]'
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
    fetchGuardConfig: async ({ guard, lastVersionSeen }) => {
      const body = {
        versionSeen: lastVersionSeen,
        selector: {
          guardName: guard,
          serviceName,
          serviceRelease,
          environment
        }
      }
      logger.debug('fetching guard config with body %o', body)
      const guardConfigResult = await hubRequest('v1/config/guard', {
        body,
        method: 'POST'
      }, guardConfigResponse)

      logger.debug('fetched guard config result: %o', guardConfigResult)

      if (guardConfigResult === null || !guardConfigResult.configDataSent) {
        return null
      }

      return {
        config: guardConfigResult.config,
        version: guardConfigResult.version
      }
    },
    getToken: async ({ guard, feature, priorityBoost, tags }) => {
      return hubRequest('v1/quota/token', {
        method: 'POST',
        body: {
          selector: {
            guardName: guard,
            featureName: feature,
            environment,
            tags
          },
          clientId,
          priorityBoost
        }
      }, stanzaTokenResponse)
    },
    getTokenLease: async ({ guard, feature, priorityBoost, tags }) => {
      const response = await hubRequest('v1/quota/lease', {
        method: 'POST',
        body: {
          selector: {
            guardName: guard,
            featureName: feature,
            environment,
            tags
          },
          clientId,
          priorityBoost
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
    validateToken: async ({ token, guard }) => {
      const response = await hubRequest('v1/quota/validatetoken', {
        method: 'POST',
        body: {
          tokens: [{
            token,
            guard
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
    },
    getAuthToken: async () => {
      const response = await hubRequest('v1/auth/token', {
        method: 'GET'
      }, stanzaAuthTokenResponse)

      return response !== null ? { token: response.bearerToken } : null
    }
  }))
}
