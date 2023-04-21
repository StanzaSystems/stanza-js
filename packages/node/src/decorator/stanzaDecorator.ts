import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaApiKeyToContext } from '../context/addStanzaApiKeyToContext'
import { bindContext } from '../context/bindContext'
import { hubService } from '../global'
import { type StanzaToken } from '../hub/hubService'
import { isTruthy } from '../utils/isTruthy'
import { initDecorator, type StanzaDecoratorOptions } from './initStanzaDecorator'

type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>

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
          token = await hubService.getToken(options)
        } catch (e) {
          console.warn('Failed to fetch the token:', e instanceof Error ? e.message : e)
        }
      }

      if (token?.granted === false) {
        return
      }

      const fnWithBoundContext = bindContext([
        token !== null ? addStanzaApiKeyToContext(token.token) : undefined,
        options.priorityBoost !== undefined ? addPriorityBoostToContext(options.priorityBoost) : undefined
      ].filter(isTruthy), fn)

      return fnWithBoundContext(...args)
    }) as (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>>
  }

  function call<Fn extends (...args: any[]) => unknown> (fn: Fn, thisArg?: ThisParameterType<Fn>, ...args: Parameters<Fn>): Promisify<ReturnType<Fn>> {
    return bind(fn).apply(thisArg, args)
  }

  function apply<Fn extends (...args: any[]) => unknown> (fn: Fn, thisArg?: ThisParameterType<Fn>, args?: Parameters<Fn>): Promisify<ReturnType<Fn>> {
    return args !== undefined ? bind(fn).apply(thisArg, args) : bind(fn).apply(thisArg)
  }
}
