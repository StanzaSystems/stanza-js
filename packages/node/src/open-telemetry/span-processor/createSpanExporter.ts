import { type SpanExporter } from '@opentelemetry/sdk-trace-node'
import { StanzaSpanExporter } from './StanzaSpanExporter'

export function createSpanExporter (traceConfig: { collectorUrl: string }): SpanExporter {
  return new StanzaSpanExporter(traceConfig)
}
