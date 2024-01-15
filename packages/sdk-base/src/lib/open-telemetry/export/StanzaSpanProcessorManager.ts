import { type Context } from '@opentelemetry/api';
import {
  NoopSpanProcessor,
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { type SpanProcessorManager } from './SpanProcessorManager';
import { StanzaConfigEntityManager } from '../StanzaConfigEntityManager';
import { BatchSpanProcessor } from './BatchSpanProcessor';

export class StanzaSpanProcessorManager implements SpanProcessorManager {
  private readonly traceConfigManager =
    new StanzaConfigEntityManager<SpanProcessor>({
      getInitial: () => new NoopSpanProcessor(),
      createWithServiceConfig: ({ traceConfig }) =>
        new BatchSpanProcessor(this.createSpanExporter(traceConfig)),
      cleanup: async (spanProcessor) => spanProcessor.shutdown(),
    });

  constructor(
    private readonly createSpanExporter: (traceConfig: {
      collectorUrl: string;
    }) => SpanExporter
  ) {}

  async forceFlushAllSpanProcessors(): Promise<void> {
    await Promise.all(
      this.traceConfigManager
        .getAllEntities()
        .map(async (processor) => processor.forceFlush())
    );
  }

  async shutdownAllSpanProcessors(): Promise<void> {
    await this.traceConfigManager.shutdown();
  }

  getSpanProcessor(context: Context): SpanProcessor {
    return this.traceConfigManager.getEntity(context);
  }
}
