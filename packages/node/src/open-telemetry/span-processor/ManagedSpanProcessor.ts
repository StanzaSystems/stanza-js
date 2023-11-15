import { context, type Context } from '@opentelemetry/api';
import {
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { type SpanProcessorManager } from './SpanProcessorManager';

export class ManagedSpanProcessor implements SpanProcessor {
  constructor(private readonly spanProcessorManager: SpanProcessorManager) {}

  async forceFlush(): Promise<void> {
    await this.spanProcessorManager.forceFlushAllSpanProcessors();
  }

  onEnd(span: ReadableSpan): void {
    this.spanProcessorManager.getSpanProcessor(context.active()).onEnd(span);
  }

  onStart(span: Span, parentContext: Context): void {
    this.spanProcessorManager
      .getSpanProcessor(parentContext)
      .onStart(span, parentContext);
  }

  async shutdown(): Promise<void> {
    await this.spanProcessorManager.shutdownAllSpanProcessors();
  }
}
