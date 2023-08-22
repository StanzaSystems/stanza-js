import Emittery from 'emittery'

const EVENT_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus')
const EVENT_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus Events')

const guardAllowed = Symbol('stanza.guard.allowed')
const guardAllowedSuccess = Symbol('stanza.guard.allowed.success')
const guardAllowedFailure = Symbol('stanza.guard.allowed.failure')
const guardAllowedDuration = Symbol('stanza.guard.allowed.duration')
const guardBlocked = Symbol('stanza.guard.blocked')

const configServiceFetchSuccess = Symbol('stanza.config.service.fetch.success')
const configServiceFetchFailure = Symbol('stanza.config.service.fetch.failure')
const configServiceFetchDuration = Symbol('stanza.config.service.fetch.duration')

const configGuardFetchSuccess = Symbol('stanza.config.guard.fetch.success')
const configGuardFetchFailure = Symbol('stanza.config.guard.fetch.failure')
const configGuardFetchDuration = Symbol('stanza.config.guard.fetch.duration')

const quotaFetchSuccess = Symbol('stanza.quota.fetch.success')
const quotaFetchFailure = Symbol('stanza.quota.fetch.failure')
const quotaFetchDuration = Symbol('stanza.quota.fetch.duration')
const quotaValidateSuccess = Symbol('stanza.quota.token.validate.success')
const quotaValidateFailure = Symbol('stanza.quota.token.validate.failure')
const quotaValidateDuration = Symbol('stanza.quota.token.validate.duration')

const telemetrySendSuccess = Symbol('stanza.telemetry.success')
const telemetrySendFailure = Symbol('stanza.telemetry.failure')

const authTokenInvalid = Symbol('stanza.auth.token.invalid')

const internalQuotaSucceeded = Symbol('stanza.internal.quota.succeeded')
const internalQuotaFailed = Symbol('stanza.internal.quota.failed')
const internalQuotaDisabled = Symbol('stanza.internal.quota.disabled')
const internalQuotaEnabled = Symbol('stanza.internal.quota.enabled')

const eventBusEvents = {
  internal: {
    quota: {
      succeeded: internalQuotaSucceeded,
      failed: internalQuotaFailed,
      disabled: internalQuotaDisabled,
      enabled: internalQuotaEnabled
    }
  },
  guard: {
    allowed: guardAllowed,
    blocked: guardBlocked,
    failed: guardAllowedFailure,
    succeeded: guardAllowedSuccess,
    duration: guardAllowedDuration
  },
  config: {
    service: {
      fetchOk: configServiceFetchSuccess,
      fetchFailed: configServiceFetchFailure,
      fetchDuration: configServiceFetchDuration
    },
    guard: {
      fetchOk: configGuardFetchSuccess,
      fetchFailed: configGuardFetchFailure,
      fetchDuration: configGuardFetchDuration
    }
  },
  quota: {
    fetchOk: quotaFetchSuccess,
    fetchFailed: quotaFetchFailure,
    fetchDuration: quotaFetchDuration,
    validateOk: quotaValidateSuccess,
    validateFailed: quotaValidateFailure,
    validateDuration: quotaValidateDuration
  },
  telemetry: {
    sendOk: telemetrySendSuccess,
    sendFailed: telemetrySendFailure
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
  parentGuardName?: string
}

export type OptionalGuardData = Partial<GuardData>

export interface DurationData {
  duration: number
}

type QuotaEndpoint = 'GetToken' | 'GetTokenLease' | 'SetTokenLeaseConsumed'
export interface QuotaEndpointData {
  endpoint: QuotaEndpoint
}

export type GuardReason = 'fail_open' | 'dark_launch' | 'quota' | 'system_load' | 'circuit_breaking' | 'bulkhead' | 'throttling'

export interface ReasonData {
  reason: GuardReason
}

type StanzaEventBus = EventBus<{
  [guardAllowed]: DefaultContextData & GuardData & FeatureData & ReasonData
  [guardBlocked]: DefaultContextData & GuardData & FeatureData & ReasonData
  [guardAllowedFailure]: DefaultContextData & GuardData & FeatureData
  [guardAllowedSuccess]: DefaultContextData & GuardData & FeatureData
  [guardAllowedDuration]: DefaultContextData & GuardData & FeatureData & DurationData
  [configServiceFetchSuccess]: DefaultContextData
  [configServiceFetchFailure]: DefaultContextData
  [configServiceFetchDuration]: DefaultContextData & DurationData
  [configGuardFetchSuccess]: DefaultContextData & GuardData
  [configGuardFetchFailure]: DefaultContextData
  [configGuardFetchDuration]: DefaultContextData & DurationData
  [quotaFetchSuccess]: DefaultContextData & QuotaEndpointData & OptionalGuardData
  [quotaFetchFailure]: DefaultContextData & QuotaEndpointData
  [quotaFetchDuration]: DefaultContextData & QuotaEndpointData & DurationData
  [quotaValidateSuccess]: DefaultContextData & GuardData
  [quotaValidateFailure]: DefaultContextData
  [quotaValidateDuration]: DefaultContextData & DurationData
  [telemetrySendSuccess]: DefaultContextData & { oTelAddress: string }
  [telemetrySendFailure]: DefaultContextData & { oTelAddress: string }
  [authTokenInvalid]: undefined
  [internalQuotaSucceeded]: undefined
  [internalQuotaFailed]: undefined
  [internalQuotaDisabled]: undefined
  [internalQuotaEnabled]: { enabledPercent: number }
}>

interface EventBusGlobal {
  [EVENT_BUS_SYMBOL]: StanzaEventBus | undefined
  [EVENT_BUS_EVENTS_SYMBOL]: typeof eventBusEvents | undefined
}
const eventBusGlobal = global as unknown as EventBusGlobal

export const eventBus: StanzaEventBus = eventBusGlobal[EVENT_BUS_SYMBOL] = eventBusGlobal[EVENT_BUS_SYMBOL] ?? new Emittery()

export const events = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] ?? eventBusEvents
