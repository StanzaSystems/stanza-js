import { serviceConfig, type ServiceConfigResult } from './model/serviceConfig'
import { fetch } from '../fetchImplementation'

const HUB_REQUEST_TIMEOUT = 1000

export type ServiceConfig = Pick<ServiceConfigResult, 'version' | 'config'>

export const createHubService = (hubUrl: string, apiKey: string) => ({
  fetchServiceConfig: async ({ serviceName, serviceRelease, environment, lastVersionSeen }: {
    serviceName: string
    serviceRelease: string
    environment: string
    lastVersionSeen?: string
  }): Promise<ServiceConfig | null> => {
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
  }
})
