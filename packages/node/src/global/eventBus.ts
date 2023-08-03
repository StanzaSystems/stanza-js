import Emittery from 'emittery'

const EVENT_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus')
const EVENT_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus Events')

const requestAllowedEvent: unique symbol = Symbol('stanza.request.allowed')
const requestBlockedEvent = Symbol('stanza.request.blocked')
const requestFailedEvent = Symbol('stanza.request.failed')
const requestSucceededEvent = Symbol('stanza.request.succeeded')
const requestLatencyEvent = Symbol('stanza.request.latency')

const configServiceFetchOk = Symbol('stanza.config.service.fetch_ok')
const configServiceFetchFailed = Symbol('stanza.config.service.fetch_failed')
const configServiceFetchLatency = Symbol('stanza.config.service.fetch_latency')

const configGuardFetchOk = Symbol('stanza.config.guard.fetch_ok')
const configGuardFetchFailed = Symbol('stanza.config.guard.fetch_failed')
const configGuardrFetchLatency = Symbol('stanza.config.guard.fetch_latency')

const quotaFetchOk = Symbol('stanza.quota.fetch_ok')
const quotaFetchFailed = Symbol('stanza.quota.fetch_failed')
const quotaFetchLatency = Symbol('stanza.quota.fetch_latency')
const quotaValidateOk = Symbol('stanza.quota.validate_ok')
const quotaValidateFailed = Symbol('stanza.quota.validate_failed')
const quotaValidateLatency = Symbol('stanza.quota.validate_latency')

const telemetrySendOk = Symbol('stanza.telemetry.send_ok')
const telemetrySendFailed = Symbol('stanza.telemetry.send_failed')

const authTokenInvalid = Symbol('stanza.auth.token_invalid')

const internalQuotaSucceeded = Symbol('stanza.internal.quota.succeeded')
const internalQuotaFailed = Symbol('stanza.internal.quota.failed')

const eventBusEvents = {
  internal: {
    quota: {
      succeeded: internalQuotaSucceeded,
      failed: internalQuotaFailed
    }
  },
  request: {
    allowed: requestAllowedEvent,
    blocked: requestBlockedEvent,
    failed: requestFailedEvent,
    succeeded: requestSucceededEvent,
    latency: requestLatencyEvent
  },
  config: {
    service: {
      fetchOk: configServiceFetchOk,
      fetchFailed: configServiceFetchFailed,
      fetchLatency: configServiceFetchLatency
    },
    guard: {
      fetchOk: configGuardFetchOk,
      fetchFailed: configGuardFetchFailed,
      fetchLatency: configGuardrFetchLatency
    }
  },
  quota: {
    fetchOk: quotaFetchOk,
    fetchFailed: quotaFetchFailed,
    fetchLatency: quotaFetchLatency,
    validateOk: quotaValidateOk,
    validateFailed: quotaValidateFailed,
    validateLatency: quotaValidateLatency
  },
  telemetry: {
    sendOk: telemetrySendOk,
    sendFailed: telemetrySendFailed
  },
  auth: {
    tokenInvalid: authTokenInvalid
  }
} as const

type GetKeys<T> = T extends Record<infer K, symbol> ? T[K] : T extends Record<infer K, unknown> ? GetKeys<T[K]> : never

type EventKeys = GetKeys<typeof eventBusEvents>

type EventBus<TData extends Record<EventKeys, unknown>> = Emittery<TData>

export interface DefaultContextData {
  serviceName: string
  environment: string
  clientId: string
  customerId?: string
}

export interface FeatureData {
  featureName: string
}

export interface GuardData {
  guardName: string
}

export type OptionalGuardData = Partial<GuardData>

export interface LatencyData {
  latency: number
}

type QuotaEndpoint = 'GetToken' | 'GetTokenLease' | 'SetTokenLeaseConsumed'
export interface QuotaEndpointData {
  endpoint: QuotaEndpoint
}

export type BlockedReason = 'quota' | 'system_load' | 'circuit_breaking' | 'bulkhead' | 'throttling'

export interface BlockedReasonData {
  reason: BlockedReason
}

type StanzaEventBus = EventBus<{
  [requestAllowedEvent]: DefaultContextData & GuardData & FeatureData
  [requestBlockedEvent]: DefaultContextData & GuardData & FeatureData & BlockedReasonData
  [requestFailedEvent]: DefaultContextData & GuardData & FeatureData
  [requestSucceededEvent]: DefaultContextData & GuardData & FeatureData
  [requestLatencyEvent]: DefaultContextData & GuardData & FeatureData & LatencyData
  [configServiceFetchOk]: DefaultContextData
  [configServiceFetchFailed]: DefaultContextData
  [configServiceFetchLatency]: DefaultContextData & LatencyData
  [configGuardFetchOk]: DefaultContextData & GuardData
  [configGuardFetchFailed]: DefaultContextData
  [configGuardrFetchLatency]: DefaultContextData & LatencyData
  [quotaFetchOk]: DefaultContextData & QuotaEndpointData & OptionalGuardData
  [quotaFetchFailed]: DefaultContextData & QuotaEndpointData
  [quotaFetchLatency]: DefaultContextData & QuotaEndpointData & LatencyData
  [quotaValidateOk]: DefaultContextData & GuardData
  [quotaValidateFailed]: DefaultContextData
  [quotaValidateLatency]: DefaultContextData & LatencyData
  [telemetrySendOk]: DefaultContextData & { oTelAddress: string }
  [telemetrySendFailed]: DefaultContextData & { oTelAddress: string }
  [authTokenInvalid]: undefined
  [internalQuotaSucceeded]: undefined
  [internalQuotaFailed]: undefined
}>

interface EventBusGlobal {
  [EVENT_BUS_SYMBOL]: StanzaEventBus | undefined
  [EVENT_BUS_EVENTS_SYMBOL]: typeof eventBusEvents | undefined
}
const eventBusGlobal = global as unknown as EventBusGlobal

export const eventBus: StanzaEventBus = eventBusGlobal[EVENT_BUS_SYMBOL] = eventBusGlobal[EVENT_BUS_SYMBOL] ?? new Emittery()

export const events = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] ?? eventBusEvents
