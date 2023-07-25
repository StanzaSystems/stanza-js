import { type Span } from '@opentelemetry/sdk-trace-node'
import { type ClientRequest, type IncomingMessage, type ServerResponse } from 'http'

export interface ASpanEnhancer {
  enhanceWithRequest: (span: Span, request: ClientRequest | IncomingMessage) => void
  enhanceWithResponse: (span: Span, response: ServerResponse | IncomingMessage) => void
}
