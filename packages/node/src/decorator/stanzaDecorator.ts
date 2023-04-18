import { withStanzaApiKey } from '../context/withStanzaApiKey'
import { hubService } from '../global'
import { type StanzaToken } from '../hub/hubService'
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
    return token !== null ? withStanzaApiKey(token.token, () => fn(...args))() : fn(...args)
  }) as (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>>
}
