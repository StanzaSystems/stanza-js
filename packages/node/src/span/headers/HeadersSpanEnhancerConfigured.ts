import { type Span } from '@opentelemetry/api'
import { type HeaderGetter, type SpanEnhancer } from '../SpanEnhancer'
import { Span as SpanClass } from '@opentelemetry/sdk-trace-node'
import { isTruthy } from '../../utils/isTruthy'
import { uniq } from 'ramda'

export class HeadersSpanEnhancerConfigured implements SpanEnhancer {
  constructor (private readonly traceConfigs: Array<{
    requestHeaderName: string[]
    responseHeaderName: string[]
    spanSelectors: Array<{
      otelAttribute: string
      value: string
    }>
  }>) {}

  enhanceWithRequest (span: Span, getHeaderValue: HeaderGetter): void {
    this.enhance(span, {
      getAttributeKey: (headerName) => {
        const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
        return `http.request.header.${otelNormalizedHeader}`
      },
      getHeaderValue,
      type: 'request'
    })
  }

  enhanceWithResponse (span: Span, getHeaderValue: HeaderGetter): void {
    this.enhance(span, {
      getAttributeKey: (headerName) => {
        const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
        return `http.response.header.${otelNormalizedHeader}`
      },
      getHeaderValue,
      type: 'response'
    })
  }

  private enhance (span: Span, { getAttributeKey, getHeaderValue, type }: { getAttributeKey: (headerName: string) => string, getHeaderValue: HeaderGetter, type: 'response' | 'request' }) {
    const headersToAdd = this.traceConfigs.map(({ requestHeaderName, responseHeaderName, spanSelectors }): string[] | undefined => {
      const headers = type === 'request' ? requestHeaderName : responseHeaderName
      const spanSelected = span instanceof SpanClass && spanSelectors.every(({ otelAttribute, value }) =>
        span.attributes[otelAttribute] === value
      )

      return spanSelected ? headers : undefined
    }).filter(isTruthy).flat()

    uniq(headersToAdd).forEach(headerName => {
      const normalizedHeader = headerName.toLowerCase()
      const rawValue = getHeaderValue(normalizedHeader)
      const value = typeof rawValue === 'string'
        ? [rawValue]
        : typeof rawValue === 'number'
          ? [rawValue.toString()]
          : rawValue

      if (value === undefined) {
        return
      }

      const key = getAttributeKey(headerName)
      span.setAttribute(key, value)
    })
  }
}
