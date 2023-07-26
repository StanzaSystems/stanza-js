import { type HeaderGetter, type SpanEnhancer } from './SpanEnhancer'
import { type Span } from '@opentelemetry/sdk-trace-node'

export class NoopSpanEnhancer implements SpanEnhancer {
  enhanceWithRequest (_span: Span, _getHeaderValue: HeaderGetter): void {}

  enhanceWithResponse (_span: Span, _getHeaderValue: HeaderGetter): void {}
}
