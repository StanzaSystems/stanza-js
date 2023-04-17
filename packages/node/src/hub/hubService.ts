import { fetch } from '../fetchImplementation'
import { decoratorConfig, type DecoratorConfigResult } from './model/decoratorConfig'
import { serviceConfig, type ServiceConfigResult } from './model/serviceConfig'
import { getToken, type GetTokenResponse } from './model/stanzaToken'

const HUB_REQUEST_TIMEOUT = 1000

export type ServiceConfig = Pick<ServiceConfigResult, 'version' | 'config'>
export type DecoratorConfig = Pick<DecoratorConfigResult, 'version' | 'config'>
export type StanzaToken = GetTokenResponse

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
  fetchDecoratorConfig: (options: FetchDecoratorConfigOptions) => Promise<DecoratorConfig | null>
  getToken: (options: GetTokenOptions) => Promise<StanzaToken | null>
}

interface HubServiceInitOptions {
  hubUrl: string
  apiKey: string
  serviceName: string
  serviceRelease: string
  environment: string
}

export const createHubService = ({ hubUrl, serviceName, serviceRelease, environment, apiKey }: HubServiceInitOptions): HubService => ({
  fetchServiceConfig: async ({ lastVersionSeen } = {}) => {
    const requestUrl = new URL(`${hubUrl}/v1/config/service`)
    requestUrl.searchParams.append('service.name', serviceName)
    requestUrl.searchParams.append('service.release', serviceRelease)
    requestUrl.searchParams.append('service.environment', environment)
    lastVersionSeen !== undefined && requestUrl.searchParams.append('versionSeen', lastVersionSeen)

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

    const serviceConfigResult = serviceConfig.safeParse(data)

    if (!serviceConfigResult.success) {
      return null
    }
    if (!serviceConfigResult.data.configDataSent) {
      return null
    }

    const serviceConfigData = serviceConfigResult.data

    return {
      config: serviceConfigData.config,
      version: serviceConfigData.version
    }
  },
  fetchDecoratorConfig: async ({ decorator, lastVersionSeen }) => {
    const requestUrl = new URL(`${hubUrl}/v1/config/decorator`)
    requestUrl.searchParams.append('decorator', decorator)
    requestUrl.searchParams.append('service.name', serviceName)
    requestUrl.searchParams.append('service.release', serviceRelease)
    requestUrl.searchParams.append('service.environment', environment)
    lastVersionSeen !== undefined && requestUrl.searchParams.append('versionSeen', lastVersionSeen)

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

    const decoratorConfigResult = decoratorConfig.safeParse(data)

    if (!decoratorConfigResult.success) {
      return null
    }
    if (!decoratorConfigResult.data.configDataSent) {
      return null
    }

    const serviceConfigData = decoratorConfigResult.data

    return {
      config: serviceConfigData.config,
      version: serviceConfigData.version
    }
  },
  getToken: async ({ decorator, feature, priorityBoost }) => {
    const requestUrl = new URL(`${hubUrl}/v1/quota/token`)
    requestUrl.searchParams.append('decorator', decorator)
    feature !== undefined && requestUrl.searchParams.append('feature', feature)
    priorityBoost !== undefined && requestUrl.searchParams.append('priorityBoos', priorityBoost.toFixed(0))

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

    const getTokenResult = getToken.safeParse(data)

    if (!getTokenResult.success) {
      return null
    }
    if (!getTokenResult.data.granted) {
      return null
    }

    const getTokenData = getTokenResult.data

    return getTokenData
  }
})
