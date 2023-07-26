import { type Span } from '@opentelemetry/api'
import { type SpanEnhancer } from './SpanEnhancer'
import { undefined } from 'zod'
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
    const getHeaderValue = (headerName: string): string[] | undefined => {
      const normalizedHeader = headerName.toLowerCase()
      const rawValue = request instanceof IncomingMessage ? request.headers[normalizedHeader] : request.getHeader(normalizedHeader)

      return typeof rawValue === 'string'
        ? [rawValue]
        : typeof rawValue === 'number'
          ? [rawValue.toString()]
          : rawValue
    }

    const getAttributeKey = (headerName: string) => {
      const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
      return `http.request.header.${otelNormalizedHeader}`
    }

    this.enhance(span, { getAttributeKey, getHeaderValue })
  }

  enhanceWithResponse (span: Span, response: ServerResponse | IncomingMessage): void {
    const getHeaderValue = (headerName: string): string[] | undefined => {
      const normalizedHeader = headerName.toLowerCase()
      const rawValue = response instanceof IncomingMessage ? response.headers[normalizedHeader] : response.getHeader(normalizedHeader)

      return typeof rawValue === 'string'
        ? [rawValue]
        : typeof rawValue === 'number'
          ? [rawValue.toString()]
          : rawValue
    }

    const getAttributeKey = (headerName: string) => {
      const otelNormalizedHeader = headerName.toLowerCase().replace(/-/g, '_')
      return `http.response.header.${otelNormalizedHeader}`
    }

    this.enhance(span, { getAttributeKey, getHeaderValue })
  }

  private enhance (span: Span, { getAttributeKey, getHeaderValue }: { getAttributeKey: (headerName: string) => string, getHeaderValue: (headerName: string) => string[] | undefined }) {
    const headersToAdd = this.traceConfigs.map(({ requestHeaderName, spanSelectors }): string[] | undefined => {
      const spanSelected = span instanceof SpanClass && spanSelectors.every(({ otelAttribute, value }) =>
        span.attributes[otelAttribute] === value
      )

      return spanSelected ? requestHeaderName : undefined
    }).filter(isTruthy).flat()

    headersToAdd.forEach(headerName => {
      const value = getHeaderValue(headerName)
      if (value !== undefined) {
        return
      }

      const key = getAttributeKey(headerName)
      span.setAttribute(key, value)
    })
  }
}
