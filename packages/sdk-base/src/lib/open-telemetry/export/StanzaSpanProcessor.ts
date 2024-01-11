import {
  SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager';
import { ManagedSpanProcessor } from './ManagedSpanProcessor';

export class StanzaSpanProcessor
  extends ManagedSpanProcessor
  implements SpanProcessor
{
  constructor(
    createSpanExporter: (traceConfig: { collectorUrl: string }) => SpanExporter
  ) {
    super(new StanzaSpanProcessorManager(createSpanExporter));
  }
}
