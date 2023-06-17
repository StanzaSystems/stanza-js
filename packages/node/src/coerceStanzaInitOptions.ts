import { type StanzaInitOptions } from './stanzaInitOptions'
import { z } from 'zod'

export type CoerceFn<K extends keyof StanzaInitOptions> = (strValue: string | undefined) => StanzaInitOptions[K] | undefined

export const coerceStringToInteger = (v: string | undefined): number | undefined => {
  const zNonEmptyString = z.string().nonempty()
  const zCoercedInteger = z.coerce.number().int()
  const parsedIntegerResult = zNonEmptyString.pipe(zCoercedInteger).safeParse(v)
  return parsedIntegerResult.success ? parsedIntegerResult.data : undefined
}
