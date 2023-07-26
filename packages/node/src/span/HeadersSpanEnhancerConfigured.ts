import { type Span } from '@opentelemetry/api'
import { type SpanEnhancer } from './SpanEnhancer'
import { Span as SpanClass } from '@opentelemetry/sdk-trace-node'
import { type ClientRequest, IncomingMessage, type ServerResponse } from 'http'
import { isTruthy } from '../utils/isTruthy'

export class HeadersSpanEnhancerConfigured implements SpanEnhancer {
  constructor (private readonly traceConfigs: Array<{
    requestHeaderName: string[]
    responseHeaderName: string[]
    spanSelectors: Array<{
      otelAttribute: string
      value: string
    }>
  }>) {}

  enhanceWithRequest (span: Span, request: ClientRequest | IncomingMessage): void {
    this.enhance(span, {
      getAttributeKey: (headerName) => {
        const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
        return `http.request.header.${otelNormalizedHeader}`
      },
      getHeaderValue: (headerName) => {
        const normalizedHeader = headerName.toLowerCase()
        return request instanceof IncomingMessage ? request.headers[normalizedHeader] : request.getHeader(normalizedHeader)
      }
    })
  }

  enhanceWithResponse (span: Span, response: ServerResponse | IncomingMessage): void {
    this.enhance(span, {
      getAttributeKey: (headerName) => {
        const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
        return `http.response.header.${otelNormalizedHeader}`
      },
      getHeaderValue: (headerName) => {
        const normalizedHeader = headerName.toLowerCase()
        return response instanceof IncomingMessage ? response.headers[normalizedHeader] : response.getHeader(normalizedHeader)
      }
    })
  }

  private enhance (span: Span, { getAttributeKey, getHeaderValue }: { getAttributeKey: (headerName: string) => string, getHeaderValue: (headerName: string) => string[] | string | number | undefined }) {
    const headersToAdd = this.traceConfigs.map(({ requestHeaderName, spanSelectors }): string[] | undefined => {
      const spanSelected = span instanceof SpanClass && spanSelectors.every(({ otelAttribute, value }) =>
        span.attributes[otelAttribute] === value
      )

      return spanSelected ? requestHeaderName : undefined
    }).filter(isTruthy).flat()

    headersToAdd.forEach(headerName => {
      const rawValue = getHeaderValue(headerName)
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
