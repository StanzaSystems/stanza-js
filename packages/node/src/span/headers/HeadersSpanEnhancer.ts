import { context } from '@opentelemetry/api'
import { StanzaConfigEntityManager } from '../../open-telemetry/StanzaConfigEntityManager'
import { HeadersSpanEnhancerConfigured } from './HeadersSpanEnhancerConfigured'
import { type Span } from '@opentelemetry/api'
import { NoopSpanEnhancer } from '../NoopSpanEnhancer'
import { type HeaderGetter, type SpanEnhancer } from '../SpanEnhancer'

export class HeadersSpanEnhancer implements SpanEnhancer {
  private readonly headersSpanEnhancerConfiguredManager = new StanzaConfigEntityManager<SpanEnhancer>({
    getInitial: () => new NoopSpanEnhancer(),
    createWithServiceConfig: ({ traceConfig }) => new HeadersSpanEnhancerConfigured(traceConfig.headerSampleConfig),
    cleanup: async () => {}
  })

  enhanceWithRequest (span: Span, getHeaderValue: HeaderGetter): void {
    const enhancer = this.headersSpanEnhancerConfiguredManager.getEntity(context.active())
    enhancer.enhanceWithRequest(span, getHeaderValue)
  }

  enhanceWithResponse (span: Span, getHeaderValue: HeaderGetter): void {
    const enhancer = this.headersSpanEnhancerConfiguredManager.getEntity(context.active())
    enhancer.enhanceWithResponse(span, getHeaderValue)
  }
}
