import { hubService } from '../global'
import { initDecorator, type StanzaDecoratorOptions } from './initStanzaDecorator'

type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>

export const stanzaDecorator = <Fn extends (...args: unknown[]) => unknown>(options: StanzaDecoratorOptions, fn: Fn): (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>> => {
  const { shouldCheckQuota } = initDecorator(options)

  return (async (...args: Parameters<Fn>) => {
    if (shouldCheckQuota()) {
      try {
        const token = await hubService.getToken(options)
        if (token?.granted === false) {
          return
        }
      } catch {
      }
    }

    return fn(...args)
  }) as (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>>
}
