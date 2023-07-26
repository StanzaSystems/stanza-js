import { type SpanEnhancer } from './SpanEnhancer'
import { type Span } from '@opentelemetry/sdk-trace-node'
import { type ClientRequest, type IncomingMessage, type ServerResponse } from 'http'

export class NoopSpanEnhancer implements SpanEnhancer {
  enhanceWithRequest (_span: Span, _request: ClientRequest | IncomingMessage): void {}

  enhanceWithResponse (_span: Span, _response: ServerResponse | IncomingMessage): void {}
}
