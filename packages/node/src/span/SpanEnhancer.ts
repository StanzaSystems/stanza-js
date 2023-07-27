import { type Span } from '@opentelemetry/api'

export type HeaderGetter = (headerName: string) => string | number | string[] | undefined

export interface SpanEnhancer {
  enhanceWithRequest: (span: Span, getHeaderValue: HeaderGetter) => void
  enhanceWithResponse: (span: Span, getHeaderValue: HeaderGetter) => void
}
