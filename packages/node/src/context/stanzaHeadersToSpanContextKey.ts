import { createGlobal } from '../global/createGlobal'
import { createContextKey } from '@opentelemetry/api'

export const stanzaHeadersToSpanContextKey = createGlobal(
  Symbol.for('[Stanza SDK] Request Headers To Span Key'),
  () => createContextKey('Request Headers To Span Key')
)
