import { type HeaderGetter, type SpanEnhancer } from './SpanEnhancer';
import { type Span } from '@opentelemetry/api';

export class NoopSpanEnhancer implements SpanEnhancer {
  enhanceWithRequest(_span: Span, _getHeaderValue: HeaderGetter): void {}

  enhanceWithResponse(_span: Span, _getHeaderValue: HeaderGetter): void {}
}
