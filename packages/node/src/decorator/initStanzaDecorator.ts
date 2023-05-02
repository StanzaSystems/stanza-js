import { getDecoratorConfig } from '../global/decoratorConfig'
import { type StanzaDecoratorOptions } from './model'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }
  startPollingDecoratorConfig(options.decorator)
  return { shouldCheckQuota }
}
