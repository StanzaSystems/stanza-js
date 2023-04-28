import { getDecoratorConfig, updateDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'

export interface StanzaDecoratorOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

async function fetchDecoratorConfig (options: StanzaDecoratorOptions) {
  try {
    const response = await hubService.fetchDecoratorConfig({
      decorator: options.decorator
    })

    console.log('##### decorator response', response)
    response !== null && updateDecoratorConfig(options.decorator, response)

    return response
  } catch (e) {
    console.warn('Failed to fetch the decorator config:', e instanceof Error ? e.message : e)
    return null
  }
}

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }
  void fetchDecoratorConfig(options)
  return { shouldCheckQuota }
}
