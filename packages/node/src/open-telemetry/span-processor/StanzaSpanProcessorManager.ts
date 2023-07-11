import { type Context } from '@opentelemetry/api'
import { NoopSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { createSpanExporter } from './createSpanExporter'
import { type SpanProcessorManager } from './SpanProcessorManager'
import { StanzaConfigEntityManager } from '../StanzaConfigEntityManager'
import { StanzaSpanProcessor } from './StanzaSpanProcessor'

export class StanzaSpanProcessorManager implements SpanProcessorManager {
  private readonly traceConfigManager = new StanzaConfigEntityManager<SpanProcessor>(
    {
      getInitial: () => new NoopSpanProcessor(),
      createWithServiceConfig: ({ traceConfig }) => new StanzaSpanProcessor([], createSpanExporter(traceConfig)),
      createWithDecoratorConfig: ({ traceConfig }) => traceConfig !== undefined ? new StanzaSpanProcessor([], createSpanExporter(traceConfig)) : undefined,
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
