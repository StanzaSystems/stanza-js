import {
  context,
  type Context,
  type TextMapGetter,
  type TextMapPropagator,
  type TextMapSetter
} from '@opentelemetry/api'
import { StanzaConfigEntityManager } from '../open-telemetry/StanzaConfigEntityManager'
import { NoopTextMapPropagator } from './NoopTextMapPropagator'
import { RequestHeadersToSpanPropagatorConfigured } from './RequestHeadersToSpanPropagatorConfigured'

export class RequestHeadersToSpanPropagator implements TextMapPropagator {
  private readonly headersToSpanPropagatorConfiguredManager = new StanzaConfigEntityManager<TextMapPropagator>(
    {
      getInitial: () => new NoopTextMapPropagator(),
      createWithServiceConfig: ({ traceConfig }) => new RequestHeadersToSpanPropagatorConfigured(traceConfig.headerSampleConfig),
      cleanup: async () => {}
    })

  inject (context: Context, carrier: unknown, setter: TextMapSetter): void {
    const propagator = this.headersToSpanPropagatorConfiguredManager.getEntity(context)
    propagator.inject(context, carrier, setter)
  }

  extract (context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const propagator = this.headersToSpanPropagatorConfiguredManager.getEntity(context)
    return propagator.extract(context, carrier, getter)
  }

  fields (): string[] {
    const propagator = this.headersToSpanPropagatorConfiguredManager.getEntity(context.active())
    return propagator.fields()
  }
}
