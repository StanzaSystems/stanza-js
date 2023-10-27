import { StanzaSampler } from './open-telemetry/sampler/StanzaSampler'
import { StanzaApiKeyPropagator } from './propagation/StanzaApiKeyPropagator'
import { StanzaBaggagePropagator } from './propagation/StanzaBaggagePropagator'
import { StanzaTokenPropagator } from './propagation/StanzaTokenPropagator'
import { HeadersSpanEnhancer } from './span/headers/HeadersSpanEnhancer'
import { createHttpHeaderGetter } from './createHttpHeaderGetter'
import { TraceConfigOverrideAdditionalInfoPropagator } from './propagation/TraceConfigOverrideAdditionalInfoPropagator'

export const addInstrumentation = async (serviceName: string, serviceRelease: string) => {
  const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http')
  const headersEnhancer = new HeadersSpanEnhancer()
  const httpInstrumentation = new HttpInstrumentation({
    requestHook: (span, request) => {
      headersEnhancer.enhanceWithRequest(span, createHttpHeaderGetter(request))
    },
    responseHook: (span, response) => {
      const responseHeaderGetter = createHttpHeaderGetter(response)
      const enhanceResponse = () => {
        headersEnhancer.enhanceWithResponse(span, responseHeaderGetter)
      }

      enhanceResponse()
      response.prependListener('end', enhanceResponse)
      response.prependListener('finish', enhanceResponse)
    }
  })
  // NOTE: @opentelemetry/sdk-node needs to be required after we create the instrumentation.
  // Otherwise, the instrumentation fails to work
  const { NodeSDK } = await import('@opentelemetry/sdk-node')
  const { CompositePropagator, W3CTraceContextPropagator } = await import('@opentelemetry/core')
  const { Resource } = await import('@opentelemetry/resources')
  const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions')
  const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics')
  const { StanzaSpanProcessor } = await import('./open-telemetry/span-processor/StanzaSpanProcessor')
  const { StanzaMetricExporter } = await import('./open-telemetry/metric/stanzaMetricExporter')
  const { StanzaInstrumentation } = await import('./open-telemetry/instrumentation/stanzaInstrumentation')

  const sdk = new NodeSDK({
    sampler: new StanzaSampler(),
    spanProcessor: new StanzaSpanProcessor(serviceName, serviceRelease) as any, // TODO: fix any cast
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceRelease
    }) as any, // TODO: fix any cast
    textMapPropagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
        new StanzaBaggagePropagator(),
        new StanzaApiKeyPropagator(),
        new StanzaTokenPropagator(),
        new TraceConfigOverrideAdditionalInfoPropagator()
      ]
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new StanzaMetricExporter(serviceName, serviceRelease)
    }) as any, // TODO: fix any cast
    instrumentations: [
      httpInstrumentation,
      new StanzaInstrumentation()
      // TODO: enable when FetchInstrumentation supports Node
      // ...(typeof globalThis.fetch === 'function' ? [new FetchInstrumentation()] : [])
    ]
  })
  sdk.start()
}
export {}
