import { updateDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type FetchDecoratorConfigOptions } from '../hub/hubService'
import { events, messageBus } from '../global/messageBus'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'

async function fetchDecoratorConfigInternal (options: FetchDecoratorConfigOptions) {
  const response = await hubService.fetchDecoratorConfig(options)

  response !== null && updateDecoratorConfig(options.decorator, response)

  return response
}

export const fetchDecoratorConfig = wrapEventsAsync(fetchDecoratorConfigInternal, {
  success: (_, { decorator }) => {
    void messageBus.emit(events.config.decorator.fetchOk, {
      decorator
    })
  },
  failure: (_, { decorator }) => {
    void messageBus.emit(events.config.decorator.fetchFailed, {
      decorator
    })
  },
  latency: (latency, { decorator }) => {
    void messageBus.emit(events.config.decorator.fetchLatency, {
      decorator,
      latency
    })
  }
})
