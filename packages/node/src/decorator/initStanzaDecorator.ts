import { hubService } from '../global/hubService'
import { type DecoratorConfig } from '../hub/model'

export interface StanzaDecoratorOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = () => {
    return decoratorConfig.initialized && decoratorConfig.data !== null && decoratorConfig.data.config?.checkQuota
  }

  let decoratorConfig = {
    initialized: false,
    data: null as DecoratorConfig | null
  }
  void (hubService.fetchDecoratorConfig({
    decorator: options.decorator
  }).then((response) => {
    if (response !== null) {
      decoratorConfig = {
        initialized: true,
        data: response
      }
    }
  })).catch((e) => {
    console.warn('Failed to fetch the decorator config:', e instanceof Error ? e.message : e)
  })
  return { shouldCheckQuota }
}
