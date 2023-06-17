import { createGlobal } from './createGlobal'
import pino from 'pino'

export const logger = createGlobal(Symbol.for('[Stanza SDK Internal] Logger'), () => pino())
