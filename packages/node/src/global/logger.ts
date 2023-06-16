import { createGlobal } from './createGlobal'
import pino from 'pino'
import { getEnvInitOptions } from '../getEnvInitOptions'

const loggerWrapper = {
  wrap: <T>({ prefix, level = 'debug' }: { prefix?: string, level?: pino.Level }, obj: T) => {
    const childLogger = logger.child({}, {
      msgPrefix: prefix
    })

    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    return (Object.entries(obj) as Array<[keyof T, unknown]>).reduce<T>((res: T, [key, value]) => {
      if (typeof value === 'function') {
        res[key] = (function (this: unknown, ...args: unknown[]) {
          childLogger[level]('%s called with %o', key, args)
          return value.call(this, ...args)
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
