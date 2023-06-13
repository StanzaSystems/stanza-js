import { type Logger, pino } from 'pino'

const STANZA_LOGGER_SYMBOL = Symbol.for('[Stanza SDK Internal] Logger')

interface StanzaLoggerGlobal {
  [STANZA_LOGGER_SYMBOL]: Logger | undefined
}
const stanzaLoggerGlobal = globalThis as unknown as StanzaLoggerGlobal

export const logger = stanzaLoggerGlobal[STANZA_LOGGER_SYMBOL] = stanzaLoggerGlobal[STANZA_LOGGER_SYMBOL] ?? pino()
