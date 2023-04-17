import { type z, type ZodType } from 'zod'
import { fetch } from '../fetchImplementation'
import { decoratorConfigResponse, type DecoratorConfigResponse } from './model/decoratorConfigResponse'
import { serviceConfigResponse, type ServiceConfigResponse } from './model/serviceConfigResponse'
import { stanzaTokenResponse, type StanzaTokenResponse } from './model/stanzaTokenResponse'

const HUB_REQUEST_TIMEOUT = 1000

export type ServiceConfig = Pick<ServiceConfigResponse, 'version' | 'config'>
export type DecoratorConfigResult = Pick<DecoratorConfigResponse, 'version' | 'config'>
export type StanzaToken = StanzaTokenResponse

interface FetchServiceConfigOptions {
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
}
type HubApiPath = string

export const createHubService = ({ hubUrl, serviceName, serviceRelease, environment, apiKey }: HubServiceInitOptions): HubService => {
  const hubRequest = async <T extends ZodType>(apiPath: HubApiPath, params: Record<string, string | undefined>, validateRequest: T): Promise<z.infer<T> | null> => {
    const requestUrl = new URL(`${hubUrl}/${apiPath}`)

    Object.entries(params).forEach(([key, value]) => {
      key !== '' && value !== undefined && value !== '' && requestUrl.searchParams.append(key, value)
    })

    const response = await Promise.race([
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey
        }
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
        decorator,
        feature,
        priorityBoost: priorityBoost?.toFixed(0)
      }, stanzaTokenResponse)

      if (getTokenResult === null || !getTokenResult.granted) {
        return null
      }

      return getTokenResult
    }
  })
}
