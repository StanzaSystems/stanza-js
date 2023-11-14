import { type Context } from '@opentelemetry/api'
import { stanzaGuardContextKey } from './stanzaGuardContextKey'

export const getStanzaGuardFromContext = (
  context: Context
): string | undefined => {
  const contextValue = context.getValue(stanzaGuardContextKey)

  return typeof contextValue === 'string' && contextValue !== ''
    ? contextValue
    : undefined
}
