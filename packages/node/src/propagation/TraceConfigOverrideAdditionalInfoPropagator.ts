import {
  type Context,
  createContextKey,
  ROOT_CONTEXT,
  type TextMapGetter,
  type TextMapPropagator
} from '@opentelemetry/api'
import { z } from 'zod'
import { StanzaConfigEntityManager } from '../open-telemetry/StanzaConfigEntityManager'
import { isTruthy } from '../utils/isTruthy'
import { uniq } from 'ramda'

const STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL = Symbol.for(
  'TraceConfigOverrideAdditionalInfo'
)

interface StanzaTraceConfigOverrideAdditionalInfoKeyGlobal {
  [STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL]: symbol | undefined
}

const stanzaTraceConfigOverrideAdditionalInfoKeyGlobal =
  global as unknown as StanzaTraceConfigOverrideAdditionalInfoKeyGlobal

const stanzaTraceConfigOverrideAdditionalInfoKey =
  (stanzaTraceConfigOverrideAdditionalInfoKeyGlobal[
    STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL
  ] =
    stanzaTraceConfigOverrideAdditionalInfoKeyGlobal[
      STANZA_TRACE_CONFIG_OVERRIDE_ADDITIONAL_INFO_KEY_SYMBOL
    ] ?? createContextKey('Stanza Trace Config Override Additional Info Key'))

const traceConfigOverrideAdditionalInfo = z.object({
  headers: z
    .record(z.union([z.string(), z.array(z.string())]).optional())
    .optional()
})

type TraceConfigOverrideAdditionalInfo = z.infer<
  typeof traceConfigOverrideAdditionalInfo
>

export const getTraceConfigOverrideAdditionalInfo = (
  context: Context
): TraceConfigOverrideAdditionalInfo => {
  const contextValue = context.getValue(
    stanzaTraceConfigOverrideAdditionalInfoKey
  )
  const parsedValue = traceConfigOverrideAdditionalInfo.safeParse(contextValue)

  if (parsedValue.success) {
    return parsedValue.data
  }
  return {}
}

export class TraceConfigOverrideAdditionalInfoPropagator
implements TextMapPropagator {
  private readonly usedOtelData = new StanzaConfigEntityManager<{
    headers: string[]
  }>({
    getInitial: () => ({ headers: [] }),
    createWithServiceConfig: (serviceConfig) => {
      return {
        headers: uniq(
          serviceConfig.traceConfig.overrides
            .map((o) => o.spanSelectors.map((s) => s.otelAttribute))
            .flat()
            .map(
              (attr) =>
                /^http.(client|server).header.(?<header>[\w_]+)$/
                  .exec(attr)
                  ?.groups?.header?.replace(/_/g, '-')
            )
            .filter(isTruthy)
        )
      }
    },
    cleanup: async () => {}
  })

  inject (): void {
    // do nothing
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headers = this.usedOtelData
      .getEntity(ROOT_CONTEXT)
      .headers.reduce<TraceConfigOverrideAdditionalInfo['headers']>(
      (resultHeaders, key) => {
        resultHeaders = resultHeaders ?? {}
        resultHeaders[key] = getter.get(carrier, key)
        return resultHeaders
      },
      undefined
    )
    return context.setValue(stanzaTraceConfigOverrideAdditionalInfoKey, {
      headers
    } satisfies TraceConfigOverrideAdditionalInfo)
  }

  fields (): string[] {
    return this.usedOtelData.getEntity(ROOT_CONTEXT).headers
  }
}
