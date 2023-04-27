import { hubService } from '../global/hubService'
import { updateServiceConfig } from '../global/serviceConfig'
import { type FetchServiceConfigOptions } from '../hub/hubService'
import { type ServiceConfig } from '../hub/model'

export async function fetchServiceConfig (options?: FetchServiceConfigOptions): Promise<ServiceConfig | null> {
  const serviceConfig = await hubService.fetchServiceConfig(options)

  serviceConfig !== null && updateServiceConfig(serviceConfig)

  return serviceConfig
}
