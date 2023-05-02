import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaApiKeyToContext } from '../context/addStanzaApiKeyToContext'
import { addStanzaDecoratorToContext } from '../context/addStanzaDecoratorToContext'
import { bindContext } from '../context/bindContext'
import { hubService } from '../global/hubService'
import { type StanzaToken } from '../hub/model'
import { isTruthy } from '../utils/isTruthy'
import { initDecorator } from './initStanzaDecorator'
import { type StanzaDecoratorOptions } from './model'
import { StanzaDecoratorError } from './stanzaDecoratorError'

type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>
const CHECK_QUOTA_TIMEOUT = 1000

export const stanzaDecorator = (options: StanzaDecoratorOptions) => {
  const { shouldCheckQuota } = initDecorator(options)

  return {
    bind,
    call,
    apply
  }

  function bind<Fn extends (...args: any[]) => unknown> (fn: Fn): (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>> {
    return (async function (...args: Parameters<Fn>) {
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
        throw new StanzaDecoratorError('TooManyRequests', 'Decorator can not be executed')
      }

      const fnWithBoundContext = bindContext([
        addStanzaDecoratorToContext(options.decorator),
        token !== null ? addStanzaApiKeyToContext(token.token) : undefined,
        options.priorityBoost !== undefined ? addPriorityBoostToContext(options.priorityBoost) : undefined
      ].filter(isTruthy), fn)

      return fnWithBoundContext(...args)
    }) as (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>>
  }

  function call<Fn extends (...args: any[]) => unknown> (fn: Fn,
    thisArg?: ThisParameterType<Fn>,
    ...args: Parameters<Fn>): Promisify<ReturnType<Fn>> {
    return bind(fn).apply(thisArg, args)
  }

  function apply<Fn extends (...args: any[]) => unknown> (fn: Fn,
    thisArg?: ThisParameterType<Fn>,
    args?: Parameters<Fn>): Promisify<ReturnType<Fn>> {
    return args !== undefined ? bind(fn).apply(thisArg, args) : bind(fn).apply(thisArg)
  }
}
