import Emittery from 'emittery'

const MESSAGE_BUS_SYMBOL = Symbol.for('[Stanza SDK Internal] Message Bus')
const MESSAGE_BUS_EVENTS_SYMBOL = Symbol.for('[Stanza SDK Internal] Message Bus Events')

const messageBustEvents = {
  request: {
    allowed: Symbol('stanza.request.allowed'),
    blocked: Symbol('stanza.request.blocked'),
    failed: Symbol('stanza.request.failed'),
    succeeded: Symbol('stanza.request.succeeded')
  }
} as const

interface MessageBusGlobal {
  [MESSAGE_BUS_SYMBOL]: Emittery | undefined
  [MESSAGE_BUS_EVENTS_SYMBOL]: typeof messageBustEvents | undefined
}
const messageBusGlobal = global as unknown as MessageBusGlobal

export const messageBus: Emittery = messageBusGlobal[MESSAGE_BUS_SYMBOL] = messageBusGlobal[MESSAGE_BUS_SYMBOL] ?? new Emittery()

export const events = messageBusGlobal[MESSAGE_BUS_EVENTS_SYMBOL] = messageBusGlobal[MESSAGE_BUS_EVENTS_SYMBOL] ?? messageBustEvents
