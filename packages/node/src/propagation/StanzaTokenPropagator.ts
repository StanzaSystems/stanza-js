import { type TextMapPropagator } from '@opentelemetry/api'
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey'
import { HeaderContextPropagator } from './HeaderContextPropagator'

const headerStanzaToken = 'x-stanza-token'

export class StanzaTokenPropagator
  extends HeaderContextPropagator
  implements TextMapPropagator
{
  constructor() {
    super(headerStanzaToken, stanzaTokenContextKey)
  }
}
