import { createGlobal } from './createGlobal'
import pino from 'pino'
import { getEnvInitOptions } from '../getEnvInitOptions'

const loggerWrapper = {
  wrap: <T>({ prefix, level = 'debug' }: { prefix?: string, level?: pino.Level }, obj: T) => {
    const prefixTrimmed = prefix?.trim()
    const childLogger = logger.child({}, {
      msgPrefix: prefixTrimmed !== undefined && prefixTrimmed !== '' ? prefixTrimmed + ' ' : undefined
    })

    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    return (Object.entries(obj) as Array<[keyof T, unknown]>).reduce<T>((res: T, [key, value]) => {
      if (typeof value === 'function') {
        res[key] = (function (this: unknown, ...args: unknown[]) {
          childLogger[level]('%s called with %o', key, args)
          const result = value.call(this, ...args)

          if (result instanceof Promise) {
            childLogger[level]('%s returned with a promise...', key)
            result.then((data) => {
              childLogger[level]('%s resolved with: %o', key, data)
            }, (err) => {
              childLogger[level]('%s errored with: %o', key, err)
            })
          } else {
            childLogger[level]('%s returned with: %o', key, result)
          }

          return result
        }) as any
      }
      return res
    }, { ...obj })
  }
}

export const logger: pino.Logger & typeof loggerWrapper = createGlobal(Symbol.for('[Stanza SDK Internal] Logger'), () => {
  const pinoLogger = pino({
    level: getEnvInitOptions().logLevel ?? 'info'
  })

  return Object.assign(
    pinoLogger,
    loggerWrapper
  )
})
