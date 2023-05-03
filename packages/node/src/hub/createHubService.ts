import { type z, type ZodType } from 'zod'
import { fetch } from '../fetchImplementation'
import { withTimeout } from '../utils/withTimeout'
import { decoratorConfigResponse } from './api/decoratorConfigResponse'
import { serviceConfigResponse } from './api/serviceConfigResponse'
import { stanzaTokenResponse } from './api/stanzaTokenResponse'
import { stanzaValidateTokenResponse } from './api/stanzaValidateTokenResponse'
import { type HubService } from './hubService'

const HUB_REQUEST_TIMEOUT = 1000

interface HubServiceInitOptions {
  hubUrl: string
  apiKey: string
  serviceName: string
  serviceRelease: string
  environment: string
  clientId: string
}
type HubApiPath = string

export const createHubService = ({ hubUrl, serviceName, serviceRelease, environment, apiKey, clientId }: HubServiceInitOptions): HubService => {
  const hubRequest = async <T extends ZodType>(apiPath: HubApiPath, params: { method?: string, searchParams?: Record<string, string | undefined>, body?: unknown }, validateRequest: T): Promise<z.infer<T> | null> => {
    const requestUrl = new URL(`${hubUrl}/${apiPath}`)

    const { method = 'GET', searchParams = {}, body } = params

    Object.entries(searchParams).forEach(([key, value]) => {
      key !== '' && value !== undefined && value !== '' && requestUrl.searchParams.append(key, value)
    })

    const response = await withTimeout(
      HUB_REQUEST_TIMEOUT,
      'Hub request timed out',
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey
        },
        method,
        ...(body != null ? { body: JSON.stringify(body) } : {})
      }))

    const data = await response.json()

    const parsedResult = validateRequest.safeParse(data)

    if (!parsedResult.success) {
      return null
    }

    return parsedResult.data
  }

  return ({
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
          decorator,
          'service.name': serviceName,
          'service.release': serviceRelease,
          'service.environment': environment,
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
          decorator,
          feature,
          environment,
          clientId,
          priorityBoost: priorityBoost?.toFixed(0)
        }
      }, stanzaTokenResponse)
    },
    validateToken: async () => {
      const response = await hubRequest('v1/quota/validatetoken', {
        method: 'POST',
        body: [{}]
      }, stanzaValidateTokenResponse)
      return response?.tokensValid ?? null
    }
  })
}
