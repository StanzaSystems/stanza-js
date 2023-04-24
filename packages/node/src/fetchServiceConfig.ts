import { hubService } from './global'
import { type ServiceConfig } from './hub/model'
import { updateServiceConfig } from './serviceConfig'

export async function fetchServiceConfig (): Promise<ServiceConfig | null> {
  const serviceConfig = await hubService.fetchServiceConfig()

  serviceConfig !== null && updateServiceConfig(serviceConfig)

  return serviceConfig
}
