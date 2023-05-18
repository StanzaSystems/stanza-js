import Emittery from 'emittery'

const EVENT_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus')
const EVENT_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Event Bus Events')

const SymbolWithDescription = (description: string) => Symbol(description) as symbol & { description: string }

const eventBusEvents = {
  request: {
    allowed: SymbolWithDescription('stanza.request.allowed'),
    blocked: SymbolWithDescription('stanza.request.blocked'),
    failed: SymbolWithDescription('stanza.request.failed'),
    succeeded: SymbolWithDescription('stanza.request.succeeded'),
    latency: SymbolWithDescription('stanza.request.latency')
  },
  config: {
    service: {
      fetchOk: SymbolWithDescription('stanza.config.service.fetch_ok'),
      fetchFailed: SymbolWithDescription('stanza.config.service.fetch_failed'),
      fetchLatency: SymbolWithDescription('stanza.config.service.fetch_latency')
    },
    decorator: {
      fetchOk: SymbolWithDescription('stanza.config.decorator.fetch_ok'),
      fetchFailed: SymbolWithDescription('stanza.config.decorator.fetch_failed'),
      fetchLatency: SymbolWithDescription('stanza.config.decorator.fetch_latency')
    }
  },
  quota: {
    fetchOk: SymbolWithDescription('stanza.quota.fetch_ok'),
    fetchFailed: SymbolWithDescription('stanza.quota.fetch_failed'),
    fetchLatency: SymbolWithDescription('stanza.quota.fetch_latency'),
    validateOk: SymbolWithDescription('stanza.quota.validate_ok'),
    validateFailed: SymbolWithDescription('stanza.quota.validate_failed'),
    validateLatency: SymbolWithDescription('stanza.quota.validate_latency')
  },
  telemetry: {
    sendOk: SymbolWithDescription('stanza.telemetry.send_ok'),
    sendFailed: SymbolWithDescription('stanza.telemetry.send_failed')
  }
} as const

interface EventBusGlobal {
  [EVENT_BUS_SYMBOL]: Emittery | undefined
  [EVENT_BUS_EVENTS_SYMBOL]: typeof eventBusEvents | undefined
}
const eventBusGlobal = global as unknown as EventBusGlobal

export const eventBus: Emittery = eventBusGlobal[EVENT_BUS_SYMBOL] = eventBusGlobal[EVENT_BUS_SYMBOL] ?? new Emittery()

export const events = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] = eventBusGlobal[EVENT_BUS_EVENTS_SYMBOL] ?? eventBusEvents
