import Emittery from 'emittery'

const MESSAGE_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Message Bus')
const MESSAGE_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Message Bus Events')

const messageBustEvents = {
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

interface MessageBusGlobal {
  [MESSAGE_BUS_SYMBOL]: Emittery | undefined
  [MESSAGE_BUS_EVENTS_SYMBOL]: typeof messageBustEvents | undefined
}
const messageBusGlobal = global as unknown as MessageBusGlobal

export const messageBus: Emittery = messageBusGlobal[MESSAGE_BUS_SYMBOL] = messageBusGlobal[MESSAGE_BUS_SYMBOL] ?? new Emittery()

export const events = messageBusGlobal[MESSAGE_BUS_EVENTS_SYMBOL] = messageBusGlobal[MESSAGE_BUS_EVENTS_SYMBOL] ?? messageBustEvents
