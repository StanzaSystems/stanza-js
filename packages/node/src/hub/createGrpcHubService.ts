import { type HubService } from './hubService'
import { createPromiseClient } from '@bufbuild/connect'
import { ConfigService } from '../../gen/stanza/hub/v1/config_connect'
import { createGrpcTransport } from '@bufbuild/connect-node'
import { type ServiceConfig } from './model'
import { type GetServiceConfigResponse } from '../../gen/stanza/hub/v1/config_pb'
import { serviceConfigResponse } from './api/serviceConfigResponse'
import { decoratorConfigResponse } from './api/decoratorConfigResponse'
import { QuotaService } from '../../gen/stanza/hub/v1/quota_connect'
import { stanzaTokenResponse } from './api/stanzaTokenResponse'
import { stanzaTokenLeaseResponse } from './api/stanzaTokenLeaseResponse'
import { stanzaValidateTokenResponse } from './api/stanzaValidateTokenResponse'
import { stanzaMarkTokensAsConsumedResponse } from './api/stanzaMarkTokensAsConsumedResponse'

interface GrpcHubServiceInitOptions {
  serviceName: string
  serviceRelease: string
  environment: string
  clientId: string
  hubUrl: string
  apiKey: string
}

export const createGrpcHubService = ({ serviceName, serviceRelease, environment, clientId, hubUrl, apiKey }: GrpcHubServiceInitOptions): HubService => {
  const transport = createGrpcTransport({
    baseUrl: hubUrl,
    httpVersion: '2',
    interceptors: [(next) => async (req) => {
      req.header.set('X-Stanza-Key', apiKey)
      return next(req)
    }]
  })
  const configClient = createPromiseClient(ConfigService, transport)
  const quotaClient = createPromiseClient(QuotaService, transport)

  return {
    getServiceMetadata: () => ({ serviceName, environment, clientId }),
    fetchServiceConfig: async (options): Promise<ServiceConfig | null> => {
      const response: GetServiceConfigResponse = await configClient.getServiceConfig({
        service: {
          name: serviceName,
          environment,
          release: serviceRelease
        },
        versionSeen: options?.lastVersionSeen
      })

      const parsed = serviceConfigResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      const { data } = parsed

      if (!data.configDataSent) {
        return null
      }

      return {
        config: data.config,
        version: data.version
      }
    },
    fetchDecoratorConfig: async (options) => {
      const response = await configClient.getDecoratorConfig({
        s: {
          serviceName,
          serviceRelease,
          environment,
          decoratorName: options.decorator
        },
        versionSeen: options.lastVersionSeen
      })

      const parsed = decoratorConfigResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      const { data } = parsed

      if (!data.configDataSent) {
        return null
      }

      return {
        config: data.config,
        version: data.version
      }
    },
    getToken: async (options) => {
      const response = await quotaClient.getToken({
        clientId,
        priorityBoost: options.priorityBoost,
        s: {
          featureName: options.feature,
          decoratorName: options.decorator,
          environment
        }
      })

      const parsed = stanzaTokenResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      return parsed.data
    },
    getTokenLease: async (options) => {
      const response = await quotaClient.getTokenLease({
        clientId,
        priorityBoost: options.priorityBoost,
        s: {
          featureName: options.feature,
          decoratorName: options.decorator,
          environment
        }

      })

      const parsed = stanzaTokenLeaseResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      const { data } = parsed

      const now = Date.now()

      if (data.leases.length === 0) {
        return { granted: false }
      }

      return {
        granted: true,
        leases: data.leases.map(lease => ({
          token: lease.token,
          feature: lease.feature,
          priorityBoost: lease.priorityBoost,
          expiresAt: now + lease.durationMsec
        }))
      }
    },
    validateToken: async (options) => {
      const response = await quotaClient.validateToken({
        tokens: [{
          token: options.token,
          decorator: {
            name: options.decorator,
            environment
          }
        }]
      })

      const parsed = stanzaValidateTokenResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      return parsed.data?.tokensValid?.[0] ?? null
    },
    markTokensAsConsumed: async (options) => {
      const response = await quotaClient.setTokenLeaseConsumed({
        tokens: options.tokens
      })

      const parsed = stanzaMarkTokensAsConsumedResponse.safeParse(response)

      if (!parsed.success) {
        return null
      }

      return { ok: true }
    }
  }
}
