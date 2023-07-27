import { StanzaSampler } from './open-telemetry/sampler/StanzaSampler'
import { StanzaApiKeyPropagator } from './propagation/StanzaApiKeyPropagator'
import { StanzaBaggagePropagator } from './propagation/StanzaBaggagePropagator'
import { StanzaPriorityBoostPropagator } from './propagation/StanzaPriorityBoostPropagator'
import { StanzaTokenPropagator } from './propagation/StanzaTokenPropagator'
import { IncomingMessage } from 'http'

export const addInstrumentation = async (serviceName: string) => {
  const { Span } = await import('@opentelemetry/sdk-trace-node')

  const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http')
  const httpInstrumentation = new HttpInstrumentation({
    requestHook: (span, request) => {
      if (span instanceof Span) {
        console.log('request is span class')
      } else {
        console.log('span', span.isRecording(), span)
      }
      if (request instanceof IncomingMessage) {
        console.log('incoming message headers (request)', request.headers)
      } else {
        console.log('client request headers', request.getHeaders())
      }
    },
    responseHook: (span, response) => {
      if (span instanceof Span) {
        console.log('response is span class')
      } else {
        console.log('span', span.isRecording(), span)
      }
      if (response instanceof IncomingMessage) {
        console.log('incoming message headers (response)', response.headers)
      } else {
        console.log('server response headers', response.getHeaders())
      }
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
    spanProcessor: new StanzaSpanProcessor() as any, // TODO: fix any cast
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    }) as any, // TODO: fix any cast
    textMapPropagator:
      new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new StanzaBaggagePropagator(),
          new StanzaPriorityBoostPropagator(),
          new StanzaApiKeyPropagator(),
          new StanzaTokenPropagator()
        ]
      }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new StanzaMetricExporter()
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
