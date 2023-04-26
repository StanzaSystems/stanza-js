import { hubService } from './global'
import { type FetchServiceConfigOptions } from './hub/hubService'
import { type ServiceConfig } from './hub/model'
import { updateServiceConfig } from './serviceConfig'

export async function fetchServiceConfig (options?: FetchServiceConfigOptions): Promise<ServiceConfig | null> {
  const serviceConfig = await hubService.fetchServiceConfig(options)

  serviceConfig !== null && updateServiceConfig(serviceConfig)

  return serviceConfig
}
