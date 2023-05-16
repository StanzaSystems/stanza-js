import { hubService } from '../global/hubService'
import { updateServiceConfig } from '../global/serviceConfig'
import { type FetchServiceConfigOptions } from '../hub/hubService'
import { type ServiceConfig } from '../hub/model'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { events, messageBus } from '../global/messageBus'

async function fetchServiceConfigInternal (options?: FetchServiceConfigOptions): Promise<ServiceConfig | null> {
  const serviceConfig = await hubService.fetchServiceConfig(options)

  serviceConfig !== null && updateServiceConfig(serviceConfig)

  return serviceConfig
}

export const fetchServiceConfig = wrapEventsAsync(fetchServiceConfigInternal, {
  success: () => {
    void messageBus.emit(events.config.service.fetchOk, {})
  },
  failure: () => {
    void messageBus.emit(events.config.service.fetchFailed, {})
  },
  latency: (latency) => {
    void messageBus.emit(events.config.service.fetchLatency, {
      latency
    })
  }
})
