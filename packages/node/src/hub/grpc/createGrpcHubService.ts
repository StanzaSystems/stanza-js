import { type HubService } from '../hubService'
import { createPromiseClient } from '@bufbuild/connect'
import { ConfigService } from '../../../gen/stanza/hub/v1/config_connect'
import { createGrpcTransport } from '@bufbuild/connect-node'
import { type ServiceConfig } from '../model'
import { serviceConfigResponse } from '../api/serviceConfigResponse'
import { decoratorConfigResponse } from '../api/decoratorConfigResponse'
import { QuotaService } from '../../../gen/stanza/hub/v1/quota_connect'
import { stanzaTokenResponse } from '../api/stanzaTokenResponse'
import { stanzaTokenLeaseResponse } from '../api/stanzaTokenLeaseResponse'
import { stanzaValidateTokenResponse } from '../api/stanzaValidateTokenResponse'
import { stanzaMarkTokensAsConsumedResponse } from '../api/stanzaMarkTokensAsConsumedResponse'
import { type z, type ZodType } from 'zod'
import { withTimeout } from '../../utils/withTimeout'

const HUB_REQUEST_TIMEOUT = 1000

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
      const data = await grpcRequest(async () => configClient.getServiceConfig({
        service: {
          name: serviceName,
          environment,
          release: serviceRelease
        },
        versionSeen: options?.lastVersionSeen
      }), serviceConfigResponse)

      if (data === null || !data.configDataSent) {
        return null
      }

      return {
        config: data.config,
        version: data.version
      }
    },
    fetchDecoratorConfig: async (options) => {
      const data = await grpcRequest(async () => configClient.getDecoratorConfig({
        s: {
          serviceName,
          serviceRelease,
          environment,
          decoratorName: options.decorator
        },
        versionSeen: options.lastVersionSeen
      }), decoratorConfigResponse)

      if (data === null || !data.configDataSent) {
        return null
      }

      return {
        config: data.config,
        version: data.version
      }
    },
    getToken: async (options) => {
      return grpcRequest(async () => quotaClient.getToken({
        clientId,
        priorityBoost: options.priorityBoost,
        s: {
          featureName: options.feature,
          decoratorName: options.decorator,
          environment
        }
      }), stanzaTokenResponse)
    },
    getTokenLease: async (options) => {
      const data = await grpcRequest(async () => quotaClient.getTokenLease({
        clientId,
        priorityBoost: options.priorityBoost,
        s: {
          featureName: options.feature,
          decoratorName: options.decorator,
          environment
        }
      }), stanzaTokenLeaseResponse)

      if (data === null) {
        return null
      }

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
      const data = await grpcRequest(async () => quotaClient.validateToken({
        tokens: [{
          token: options.token,
          decorator: {
            name: options.decorator,
            environment
          }
        }]
      }), stanzaValidateTokenResponse)

      return data?.tokensValid?.[0] ?? null
    },
    markTokensAsConsumed: async (options) => {
      const data = await grpcRequest(async () => quotaClient.setTokenLeaseConsumed({
        tokens: options.tokens
      }),
      stanzaMarkTokensAsConsumedResponse
      )

      return data === null ? null : { ok: true }
    }
  }
}

const grpcRequest = async <T extends ZodType>(req: () => Promise<unknown>, validateResult: T): Promise<z.infer<T> | null> => {
  const response = await withTimeout(
    HUB_REQUEST_TIMEOUT,
    'Hub request timed out',
    req()
  )

  const parsed = validateResult.safeParse(response)

  if (!parsed.success) {
    return null
  }

  return parsed.data
}