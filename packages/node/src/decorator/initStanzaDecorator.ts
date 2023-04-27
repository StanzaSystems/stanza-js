import { getDecoratorConfig } from '../global/decoratorConfig'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'

export interface StanzaDecoratorOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }
  startPollingDecoratorConfig(options.decorator)
  return { shouldCheckQuota }
}
