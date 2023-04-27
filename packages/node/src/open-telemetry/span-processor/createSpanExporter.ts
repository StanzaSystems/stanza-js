import { Metadata } from '@grpc/grpc-js'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { type SpanExporter } from '@opentelemetry/sdk-trace-node'
import { type ServiceConfig } from '../../hub/model'

export function createSpanExporter (traceConfig: ServiceConfig['config']['traceConfig']): SpanExporter {
  const metadata = new Metadata()
  metadata.set('x-stanza-key', traceConfig.collectorKey)

  return new OTLPTraceExporter({
    url: traceConfig.collectorUrl,
    metadata
  })
}
