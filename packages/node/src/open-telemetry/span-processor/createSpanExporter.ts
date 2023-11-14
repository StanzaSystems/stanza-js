import { type SpanExporter } from '@opentelemetry/sdk-trace-node'
import { StanzaSpanExporter } from './StanzaSpanExporter'

export function createSpanExporter(
  traceConfig: { collectorUrl: string },
  serviceName: string,
  serviceRelease: string
): SpanExporter {
  return new StanzaSpanExporter(traceConfig, serviceName, serviceRelease)
}
