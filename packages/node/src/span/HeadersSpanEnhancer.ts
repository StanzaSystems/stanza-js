import { context } from '@opentelemetry/api'
import { StanzaConfigEntityManager } from '../open-telemetry/StanzaConfigEntityManager'
import { HeadersSpanEnhancerConfigured } from './HeadersSpanEnhancerConfigured'
import { type Span } from '@opentelemetry/sdk-trace-node'
import { type ClientRequest, type IncomingMessage, type ServerResponse } from 'http'
import { NoopSpanEnhancer } from './NoopSpanEnhancer'
import { type SpanEnhancer } from './SpanEnhancer'

export class HeadersSpanEnhancer implements SpanEnhancer {
  private readonly headersSpanEnhancerConfiguredManager = new StanzaConfigEntityManager<SpanEnhancer>({
    getInitial: () => new NoopSpanEnhancer(),
    createWithServiceConfig: ({ traceConfig }) => new HeadersSpanEnhancerConfigured(traceConfig.headerSampleConfig),
    cleanup: async () => {}
  })

  enhanceWithRequest (span: Span, request: ClientRequest | IncomingMessage): void {
    const propagator = this.headersSpanEnhancerConfiguredManager.getEntity(context.active())
    propagator.enhanceWithRequest(span, request)
  }

  enhanceWithResponse (span: Span, response: ServerResponse | IncomingMessage): void {
    const propagator = this.headersSpanEnhancerConfiguredManager.getEntity(context.active())
    propagator.enhanceWithResponse(span, response)
  }
}
