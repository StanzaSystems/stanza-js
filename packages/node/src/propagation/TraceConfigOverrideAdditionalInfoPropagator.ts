import {
  type Context,
  createContextKey,
  type TextMapGetter,
  type TextMapPropagator
} from '@opentelemetry/api'
import { z } from 'zod'

const STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL = Symbol.for(
  'TraceConfigOverrideAdditionalInfo'
)

interface StanzaTraceConfigOverrideAdditionalInfoKeyGlobal {
  [STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL]: symbol | undefined
}

const stanzaTraceConfigOverrideAdditionalInfoKeyGlobal = global as unknown as StanzaTraceConfigOverrideAdditionalInfoKeyGlobal

const stanzaTraceConfigOverrideAdditionalInfoKey = stanzaTraceConfigOverrideAdditionalInfoKeyGlobal[STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL] = stanzaTraceConfigOverrideAdditionalInfoKeyGlobal[STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL] ?? createContextKey(
  'Stanza Trace Config Override Additional Info Key')

const traceConfigOverrideAdditionalInfo = z.object({
  headers: z.record(z.union([z.string(), z.array(z.string())]).optional()).optional()
})

type TraceConfigOverrideAdditionalInfo = z.infer<typeof traceConfigOverrideAdditionalInfo>

export const getTraceConfigOverrideAdditionalInfo = (context: Context): TraceConfigOverrideAdditionalInfo => {
  const contextValue = context.getValue(stanzaTraceConfigOverrideAdditionalInfoKey)
  const parsedValue = traceConfigOverrideAdditionalInfo.safeParse(contextValue)

  if (parsedValue.success) {
    return parsedValue.data
  }
  return {}
}

export class TraceConfigOverrideAdditionalInfoPropagator implements TextMapPropagator {
  inject (): void {
    // do nothing
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headers = getter.keys(carrier).reduce<NonNullable<TraceConfigOverrideAdditionalInfo['headers']>>((resultHeaders, key) => {
      resultHeaders[key] = getter.get(carrier, key)
      return resultHeaders
    }, {})
    return context.setValue(stanzaTraceConfigOverrideAdditionalInfoKey, {
      headers
    } satisfies TraceConfigOverrideAdditionalInfo)
  }

  fields (): string[] {
    return []
  }
}
