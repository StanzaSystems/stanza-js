import { type Context } from '@opentelemetry/api'
import { BatchSpanProcessor, NoopSpanProcessor, type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { stanzaDecoratorContextKey } from '../context/stanzaDecoratorContextKey'
import { addDecoratorConfigListener, getDecoratorConfig } from '../global/decoratorConfig'
import { addServiceConfigListener, getServiceConfig } from '../global/serviceConfig'
import { type ServiceConfig } from '../hub/model'
import { createSpanExporter } from './createSpanExporter'
import { type SpanProcessorManager } from './SpanProcessorManager'

export class StanzaSpanProcessorManager implements SpanProcessorManager {
  private serviceProcessor: SpanProcessor = new NoopSpanProcessor()
  private readonly decoratorProcessors: Record<string, SpanProcessor> = {}
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener(({ config: { traceConfig } }) => {
    this.updateServiceProcessor(traceConfig)
  })

  private readonly unsubscribeDecoratorConfigListeners: Array<() => void> = []

  constructor () {
    const serviceConfig = getServiceConfig()
    if (serviceConfig?.config?.traceConfig !== undefined) {
      this.updateServiceProcessor(serviceConfig.config.traceConfig)
    }
  }

  async forceFlushAllSpanProcessors (): Promise<void> {
    await Promise.all(this.allSpanProcessors.map(async processor => processor.forceFlush()))
  }

  async shutdownAllSpanProcessors (): Promise<void> {
    this.unsubscribeServiceConfigListener()
    this.unsubscribeDecoratorConfigListeners.forEach(unsubscribe => { unsubscribe() })
  }

  getSpanProcessor (context: Context): SpanProcessor {
    const decoratorProcessor = this.getDecoratorProcessor(context)
    return decoratorProcessor ?? this.serviceProcessor
  }

  private get allSpanProcessors () {
    return [
      this.serviceProcessor,
      ...Object.values(this.decoratorProcessors).flat()
    ]
  }

  private updateServiceProcessor (traceConfig: ServiceConfig['config']['traceConfig']) {
    void this.serviceProcessor.shutdown()
    this.serviceProcessor = new BatchSpanProcessor(createSpanExporter(traceConfig))
  }

  private getDecoratorProcessor (context: Context): SpanProcessor | undefined {
    const decoratorContextValue = context.getValue(stanzaDecoratorContextKey)
    const decoratorName = typeof (decoratorContextValue) === 'string' ? decoratorContextValue : undefined
    const decoratorProcessor = this.decoratorProcessors[decoratorName ?? '']

    if (decoratorProcessor !== undefined || decoratorName === undefined) {
      return decoratorProcessor
    }

    this.unsubscribeDecoratorConfigListeners.push(addDecoratorConfigListener(decoratorName, ({ config: { traceConfig } }) => {
      if (traceConfig !== undefined) {
        void this.decoratorProcessors[decoratorName]?.shutdown()
        this.decoratorProcessors[decoratorName] = new BatchSpanProcessor(createSpanExporter(traceConfig))
      }
    }))

    const decoratorConfig = getDecoratorConfig(decoratorName)

    if (decoratorConfig?.config?.traceConfig !== undefined) {
      const decoratorSpanProcessor = new BatchSpanProcessor(createSpanExporter(decoratorConfig.config.traceConfig))
      this.decoratorProcessors[decoratorName] = decoratorSpanProcessor
      return decoratorSpanProcessor
    }

    return undefined
  }
}
