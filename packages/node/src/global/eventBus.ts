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

const configDecoratorFetchOk = Symbol('stanza.config.decorator.fetch_ok')
const configDecoratorFetchFailed = Symbol('stanza.config.decorator.fetch_failed')
const configDecoratorFetchLatency = Symbol('stanza.config.decorator.fetch_latency')

const quotaFetchOk = Symbol('stanza.quota.fetch_ok')
const quotaFetchFailed = Symbol('stanza.quota.fetch_failed')
const quotaFetchLatency = Symbol('stanza.quota.fetch_latency')
const quotaValidateOk = Symbol('stanza.quota.validate_ok')
const quotaValidateFailed = Symbol('stanza.quota.validate_failed')
const quotaValidateLatency = Symbol('stanza.quota.validate_latency')

const telemetrySendOk = Symbol('stanza.telemetry.send_ok')
const telemetrySendFailed = Symbol('stanza.telemetry.send_failed')

const authTokenInvalid = Symbol('stanza.auth.token_invalid')

const eventBusEvents = {
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
    decorator: {
      fetchOk: configDecoratorFetchOk,
      fetchFailed: configDecoratorFetchFailed,
      fetchLatency: configDecoratorFetchLatency
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

export interface DecoratorData {
  decoratorName: string
}

export type OptionalDecoratorData = Partial<DecoratorData>

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
  [requestAllowedEvent]: DefaultContextData & DecoratorData & FeatureData
  [requestBlockedEvent]: DefaultContextData & DecoratorData & FeatureData & BlockedReasonData
  [requestFailedEvent]: DefaultContextData & DecoratorData & FeatureData
  [requestSucceededEvent]: DefaultContextData & DecoratorData & FeatureData
  [requestLatencyEvent]: DefaultContextData & DecoratorData & FeatureData & LatencyData
  [configServiceFetchOk]: DefaultContextData
  [configServiceFetchFailed]: DefaultContextData
  [configServiceFetchLatency]: DefaultContextData & LatencyData
  [configDecoratorFetchOk]: DefaultContextData & DecoratorData
  [configDecoratorFetchFailed]: DefaultContextData
  [configDecoratorFetchLatency]: DefaultContextData & LatencyData
  [quotaFetchOk]: DefaultContextData & QuotaEndpointData & OptionalDecoratorData
  [quotaFetchFailed]: DefaultContextData & QuotaEndpointData
  [quotaFetchLatency]: DefaultContextData & QuotaEndpointData & LatencyData
  [quotaValidateOk]: DefaultContextData & DecoratorData
  [quotaValidateFailed]: DefaultContextData
  [quotaValidateLatency]: DefaultContextData & LatencyData
  [telemetrySendOk]: DefaultContextData & { oTelAddress: string }
  [telemetrySendFailed]: DefaultContextData & { oTelAddress: string }
  [authTokenInvalid]: undefined
}>

interface EventBusGlobal {
  [EVENT_BUS_SYMBOL]: StanzaEventBus | undefined
  [EVENT_BUS_EVENTS_SYMBOL]: typeof eventBusEvents | undefined
}
const eventBusGlobal = global as unknown as EventBusGlobal

export const eventBus: StanzaEventBus = eventBusGlobal[EVENT_BUS_SYMBOL] = eventBusGlobal[EVENT_BUS_SYMBOL] ?? new Emittery()

export const events = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] ?? eventBusEvents
