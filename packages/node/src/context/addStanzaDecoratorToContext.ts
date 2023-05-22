import { type Context } from '@opentelemetry/api'
import { stanzaDecoratorContextKey } from './stanzaDecoratorContextKey'

export const addStanzaDecoratorToContext = (name: string) => (context: Context): Context => context.setValue(stanzaDecoratorContextKey, name)
