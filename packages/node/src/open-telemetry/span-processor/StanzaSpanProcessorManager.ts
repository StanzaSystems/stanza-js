import { type Context } from '@opentelemetry/api'
import { BatchSpanProcessor, NoopSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { createSpanExporter } from './createSpanExporter'
import { type SpanProcessorManager } from './SpanProcessorManager'
import { StanzaConfigEntityManager } from '../StanzaConfigEntityManager'

export class StanzaSpanProcessorManager implements SpanProcessorManager {
  private readonly traceConfigManager = new StanzaConfigEntityManager<SpanProcessor>(
    {
      getInitial: () => new NoopSpanProcessor(),
      createWithServiceConfig: ({ traceConfig }) => new BatchSpanProcessor(createSpanExporter(traceConfig)),
      cleanup: async spanProcessor => spanProcessor.shutdown()
    })

  async forceFlushAllSpanProcessors (): Promise<void> {
    await Promise.all(this.traceConfigManager.getAllEntities().map(async processor => processor.forceFlush()))
  }

  async shutdownAllSpanProcessors (): Promise<void> {
    await this.traceConfigManager.shutdown()
  }

  getSpanProcessor (context: Context): SpanProcessor {
    return this.traceConfigManager.getEntity(context)
  }
}
