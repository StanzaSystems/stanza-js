import { hubService } from '../global'

interface StanzaDecoratorOptions {
  decorator: string
  feature?: string
  priorityBoost?: number
}

type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>

export const stanzaDecorator = <Fn extends (...args: unknown[]) => unknown>(options: StanzaDecoratorOptions, fn: Fn): (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>> => {
  void hubService.fetchDecoratorConfig({
    decorator: options.decorator
  })

  return (async (...args: Parameters<Fn>) => {
    try {
      const token = await hubService.getToken(options)
      if (token?.granted === false) {
        return
      }
    } catch {}

    return fn(...args)
  }) as (...args: Parameters<Fn>) => Promisify<ReturnType<Fn>>
}
