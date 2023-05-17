import Emittery from 'emittery'

const EVENT_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus')
const EVENT_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus Events')

const eventBusEvents = {
  request: {
    allowed: Symbol('stanza.request.allowed'),
    blocked: Symbol('stanza.request.blocked'),
    failed: Symbol('stanza.request.failed'),
    succeeded: Symbol('stanza.request.succeeded'),
    latency: Symbol('stanza.request.latency')
  },
  config: {
    service: {
      fetchOk: Symbol('stanza.config.service.fetch_ok'),
      fetchFailed: Symbol('stanza.config.service.fetch_failed'),
      fetchLatency: Symbol('stanza.config.service.fetch_latency')
    },
    decorator: {
      fetchOk: Symbol('stanza.config.decorator.fetch_ok'),
      fetchFailed: Symbol('stanza.config.decorator.fetch_failed'),
      fetchLatency: Symbol('stanza.config.decorator.fetch_latency')
    }
  },
  quota: {
    fetchOk: Symbol('stanza.quota.fetch_ok'),
    fetchFailed: Symbol('stanza.quota.fetch_failed'),
    fetchLatency: Symbol('stanza.quota.fetch_latency'),
    validateOk: Symbol('stanza.quota.validate_ok'),
    validateFailed: Symbol('stanza.quota.validate_failed'),
    validateLatency: Symbol('stanza.quota.validate_latency')
  },
  telemetry: {
    sendOk: Symbol('stanza.telemetry.send_ok'),
    sendFailed: Symbol('stanza.telemetry.send_failed')
  }
} as const

interface EventBusGlobal {
  [EVENT_BUS_SYMBOL]: Emittery | undefined
  [EVENT_BUS_EVENTS_SYMBOL]: typeof eventBusEvents | undefined
}
const eventBusGlobal = global as unknown as EventBusGlobal

export const eventBus: Emittery = eventBusGlobal[EVENT_BUS_SYMBOL] = eventBusGlobal[EVENT_BUS_SYMBOL] ?? new Emittery()

export const events = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] ?? eventBusEvents
