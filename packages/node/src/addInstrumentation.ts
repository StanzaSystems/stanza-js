import { StanzaSampler } from './open-telemetry/sampler/StanzaSampler'
import { StanzaApiKeyPropagator } from './propagation/StanzaApiKeyPropagator'
import { StanzaBaggagePropagator } from './propagation/StanzaBaggagePropagator'
import { StanzaPriorityBoostPropagator } from './propagation/StanzaPriorityBoostPropagator'
import { StanzaTokenPropagator } from './propagation/StanzaTokenPropagator'

export const addInstrumentation = async (serviceName: string) => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')

  const httpInstrumentation = new HttpInstrumentation()
  // NOTE: @opentelemetry/sdk-node needs to be required after we create the instrumentation.
  // Otherwise, the instrumentation fails to work
  const { NodeSDK } = require('@opentelemetry/sdk-node')
  const { CompositePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core')
  const { Resource } = require('@opentelemetry/resources')
  const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
  const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics')
  const { StanzaSpanProcessor } = await import('./open-telemetry/span-processor/StanzaSpanProcessor')
  const { StanzaMetricExporter } = await import('./open-telemetry/metric/stanzaMetricExporter')
  const { StanzaInstrumentation } = await import('./open-telemetry/instrumentation/stanzaInstrumentation')

  /* eslint-enable @typescript-eslint/no-var-requires */
  const sdk = new NodeSDK({
    sampler: new StanzaSampler(),
    spanProcessor: new StanzaSpanProcessor(),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    }),
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
    }),
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
