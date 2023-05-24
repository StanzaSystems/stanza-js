import { StanzaSampler } from './open-telemetry/sampler/StanzaSampler'
import { StanzaApiKeyPropagator } from './propagation/StanzaApiKeyPropagator'
import { StanzaBaggagePropagator } from './propagation/StanzaBaggagePropagator'
import { StanzaPriorityBoostPropagator } from './propagation/StanzaPriorityBoostPropagator'
import { StanzaTokenPropagator } from './propagation/StanzaTokenPropagator'
import { context, type Span as ISpan } from '@opentelemetry/api'

import { type IncomingMessage } from 'http'
import { StanzaManagedAttributesExtractor } from './open-telemetry/StanzaManagedAttributesExtractor'
import { Span } from '@opentelemetry/sdk-trace-node'

export const addInstrumentation = async (serviceName: string) => {
  const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http')

  const attributesExtractor = new StanzaManagedAttributesExtractor()

  const httpInstrumentation = new HttpInstrumentation({
    // // headersToSpanAttributes: {
    // // }
    // applyCustomAttributesOnSpan: (span: ISpan) => {
    //   console.log('is trace node span:', span instanceof Span)
    //   if (span instanceof Span) {
    //     console.log('attr', span.attributes)
    //   }
    //   if ('attributes' in span) {
    //     console.log('attr', span.attributes)
    //     console.log(span.constructor)
    //
    //     console.log(Object.getPrototypeOf(span))
    //   }
    //   // console.log('applyCustomAttributesOnSpan: ', span)
    //   return {}
    // },
    // startIncomingSpanHook: (request: IncomingMessage) => {
    //   attributesExtractor.extractAttributes(context.active(), request)
    //   return {}
    // }
  })

  httpInstrumentation.setConfig()
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
