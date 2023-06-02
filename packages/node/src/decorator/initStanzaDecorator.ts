import { type StanzaDecoratorOptions } from './model'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'
import { initDecoratorGuard } from './guard'

export const initDecorator = (options: StanzaDecoratorOptions) => {
  startPollingDecoratorConfig(options.decorator)

  return initDecoratorGuard(options)
}
