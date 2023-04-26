import { type z, type ZodType } from 'zod'
import { fetch } from '../fetchImplementation'
import { decoratorConfigResponse } from './api/decoratorConfigResponse'
import { serviceConfigResponse } from './api/serviceConfigResponse'
import { stanzaTokenResponse } from './api/stanzaTokenResponse'
import { type DecoratorConfigResult, type ServiceConfig, type StanzaToken } from './model'

const HUB_REQUEST_TIMEOUT = 1000

export interface FetchServiceConfigOptions {
  lastVersionSeen?: string
}

interface FetchDecoratorConfigOptions {
  decorator: string
  lastVersionSeen?: string
}

interface GetTokenOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

export interface HubService {
  fetchServiceConfig: (options?: FetchServiceConfigOptions) => Promise<ServiceConfig | null>
  fetchDecoratorConfig: (options: FetchDecoratorConfigOptions) => Promise<DecoratorConfigResult | null>
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>
}

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
  const hubRequest = async <T extends ZodType>(apiPath: HubApiPath, params: Record<string, string | undefined> & { method?: string }, validateRequest: T): Promise<z.infer<T> | null> => {
    const requestUrl = new URL(`${hubUrl}/${apiPath}`)

    const { method = 'GET', ...restParams } = params

    Object.entries(restParams).forEach(([key, value]) => {
      key !== '' && value !== undefined && value !== '' && requestUrl.searchParams.append(key, value)
    })

    const response = await Promise.race([
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey
        },
        method
      }),
      new Promise<Promise<Response>>((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Hub request timed out'))
        }, HUB_REQUEST_TIMEOUT)
      })
    ])

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
        'service.name': serviceName,
        'service.release': serviceRelease,
        'service.environment': environment,
        versionSeen: lastVersionSeen
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
        decorator,
        'service.name': serviceName,
        'service.release': serviceRelease,
        'service.environment': environment,
        versionSeen: lastVersionSeen
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
      const getTokenResult = await hubRequest('v1/quota/token', {
        method: 'POST',
        decorator,
        feature,
        environment,
        clientId,
        priorityBoost: priorityBoost?.toFixed(0)
      }, stanzaTokenResponse)

      if (getTokenResult === null || !getTokenResult.granted) {
        return null
      }

      return getTokenResult
    }
  })
}
