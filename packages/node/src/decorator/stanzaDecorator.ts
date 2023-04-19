import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaApiKeyToContext } from '../context/addStanzaApiKeyToContext'
import { bindContext } from '../context/bindContext'
import { hubService } from '../global'
import { type StanzaToken } from '../hub/hubService'
import { isTruthy } from '../utils/isTruthy'
import { initDecorator, type StanzaDecoratorOptions } from './initStanzaDecorator'

type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>

export const stanzaDecorator = <Fn extends (...args: any[]) => unknown>(options: StanzaDecoratorOptions, fn: Fn): (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>> => {
  const { shouldCheckQuota } = initDecorator(options)

  return (async (...args: Parameters<Fn>) => {
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
