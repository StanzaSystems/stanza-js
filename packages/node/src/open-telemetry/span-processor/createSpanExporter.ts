import { type SpanExporter } from '@opentelemetry/sdk-trace-node'
import { type ServiceConfig } from '../../hub/model'
import { StanzaSpanExporter } from './StanzaSpanExporter'

export function createSpanExporter (traceConfig: ServiceConfig['config']['traceConfig']): SpanExporter {
  return new StanzaSpanExporter(traceConfig)
}
