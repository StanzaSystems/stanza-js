import { type Context } from '@opentelemetry/api'
import { stanzaDecoratorContextKey } from '../context/stanzaDecoratorContextKey'
import { addDecoratorConfigListener, getDecoratorConfig } from '../global/decoratorConfig'
import { addServiceConfigListener, getServiceConfig } from '../global/serviceConfig'
import { type ServiceConfig } from '../hub/model'

export class StanzaTraceConfigEntityManager<T> {
  private serviceEntity: T
  private readonly decoratorEntities: Record<string, T> = {}
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener(({ config: { traceConfig } }) => {
    this.updateEntity(traceConfig)
  })

  private readonly unsubscribeDecoratorConfigListeners: Array<() => void> = []

  constructor (
    private readonly options: {
      getInitial: () => T
      create: (traceConfig: ServiceConfig['config']['traceConfig']) => T
      cleanup: (entity: T) => Promise<void>
    }
  ) {
    this.serviceEntity = this.options.getInitial()

    const serviceConfig = getServiceConfig()
    if (serviceConfig?.config?.traceConfig !== undefined) {
      this.updateEntity(serviceConfig.config.traceConfig)
    }
  }

  getEntity (context: Context): T {
    const decoratorEntity = this.getDecoratorEntity(context)
    return decoratorEntity ?? this.serviceEntity
  }

  async shutdown (): Promise<void> {
    this.unsubscribeServiceConfigListener()
    this.unsubscribeDecoratorConfigListeners.forEach(u => { u() })
    await Promise.all(this.getAllEntities().map(async entity => this.options.cleanup(entity)))
  }

  getAllEntities (): T[] {
    return [
      this.serviceEntity,
      ...Object.values(this.decoratorEntities).flat() as T[]
    ]
  }

  private updateEntity (traceConfig: ServiceConfig['config']['traceConfig']) {
    this.serviceEntity = this.options.create(traceConfig)
  }

  private getDecoratorEntity (context: Context): T | undefined {
    const decoratorContextValue = context.getValue(stanzaDecoratorContextKey)
    const decoratorName = typeof (decoratorContextValue) === 'string' ? decoratorContextValue : undefined
    const decoratorProcessor = this.decoratorEntities[decoratorName ?? '']

    if (decoratorProcessor !== undefined || decoratorName === undefined) {
      return decoratorProcessor
    }

    this.unsubscribeDecoratorConfigListeners.push(addDecoratorConfigListener(decoratorName, ({ config: { traceConfig } }) => {
      if (traceConfig !== undefined) {
        if (this.decoratorEntities[decoratorName] !== undefined) {
          void this.options.cleanup(this.decoratorEntities[decoratorName])
        }
        this.decoratorEntities[decoratorName] = this.options.create(traceConfig)
      }
    }))

    const decoratorConfig = getDecoratorConfig(decoratorName)

    if (decoratorConfig?.config?.traceConfig !== undefined) {
      const decoratorEntity = this.options.create(decoratorConfig.config.traceConfig)
      if (this.decoratorEntities[decoratorName] !== undefined) {
        void this.options.cleanup(this.decoratorEntities[decoratorName])
      }
      this.decoratorEntities[decoratorName] = decoratorEntity
      return decoratorEntity
    }

    return undefined
  }
}
