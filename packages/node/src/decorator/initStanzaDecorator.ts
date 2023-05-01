import { getDecoratorConfig } from '../global/decoratorConfig'
import { hubService } from '../global/hubService'
import { type StanzaToken } from '../hub/model'
import { type StanzaDecoratorOptions } from './model'
import { StanzaDecoratorError } from './stanzaDecoratorError'
import { startPollingDecoratorConfig } from './startPollingDecoratorConfig'
const CHECK_QUOTA_TIMEOUT = 1000

export const initDecorator = (options: StanzaDecoratorOptions) => {
  const shouldCheckQuota = (): boolean => {
    const decoratorConfig = getDecoratorConfig(options.decorator)

    return decoratorConfig?.config?.checkQuota === true
  }
  startPollingDecoratorConfig(options.decorator)
  return { guard }

  async function guard () {
    let token: StanzaToken | null = null
    if (shouldCheckQuota()) {
      try {
        token = await Promise.race([
          hubService.getToken(options),
          new Promise<ReturnType<typeof hubService.getToken>>((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Check quota timed out'))
            }, CHECK_QUOTA_TIMEOUT)
          })
        ])
      } catch (e) {
        console.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
      }
    }

    if (token?.granted === false) {
      throw new StanzaDecoratorError('TooManyRequests', 'Decorator can\'t be executed')
    }

    return token?.token ?? null
  }
}
