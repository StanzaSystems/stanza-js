import { type SpanExporter } from '@opentelemetry/sdk-trace-base';
import { StanzaSpanExporter } from './StanzaSpanExporter';

export function createNodeSpanExporter(
  traceConfig: { collectorUrl: string },
  serviceName: string,
  serviceRelease: string
): SpanExporter {
  return new StanzaSpanExporter(traceConfig, serviceName, serviceRelease);
}
