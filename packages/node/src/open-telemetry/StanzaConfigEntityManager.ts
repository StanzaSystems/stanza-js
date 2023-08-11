import { type Context } from '@opentelemetry/api'
import { stanzaGuardContextKey } from '../context/stanzaGuardContextKey'
import { addGuardConfigListener, getGuardConfig } from '../global/guardConfig'
import { addServiceConfigListener, getServiceConfig } from '../global/serviceConfig'
import { type GuardConfig, type ServiceConfig } from '../hub/model'

export class StanzaConfigEntityManager<T> {
  private serviceEntity: T
  private readonly decoratorEntities: Record<string, T> = {}
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener(({ config }) => {
    this.updateServiceEntity(config)
  })

  private readonly unsubscribeDecoratorConfigListeners: Array<() => void> = []

  constructor (
    private readonly options: {
      getInitial: () => T
      createWithServiceConfig: (serviceConfig: NonNullable<ServiceConfig['config']>) => T
      createWithDecoratorConfig?: (decoratorConfig: NonNullable<GuardConfig['config']>) => T | undefined
      cleanup: (entity: T) => Promise<void>
    }
  ) {
    this.serviceEntity = this.options.getInitial()

    const serviceConfig = getServiceConfig()
    if (serviceConfig?.config !== undefined) {
      this.updateServiceEntity(serviceConfig.config)
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

  private updateServiceEntity (serviceConfig: NonNullable<ServiceConfig['config']>) {
    this.serviceEntity = this.options.createWithServiceConfig(serviceConfig)
  }

  private getDecoratorEntity (context: Context): T | undefined {
    const decoratorContextValue = context.getValue(stanzaGuardContextKey)
    const decoratorName = typeof (decoratorContextValue) === 'string' ? decoratorContextValue : undefined
    const decoratorProcessor = this.decoratorEntities[decoratorName ?? '']

    if (decoratorProcessor !== undefined || decoratorName === undefined) {
      return decoratorProcessor
    }

    this.unsubscribeDecoratorConfigListeners.push(addGuardConfigListener(decoratorName, ({ config }) => {
      if (config !== undefined) {
        if (this.decoratorEntities[decoratorName] !== undefined) {
          void this.options.cleanup(this.decoratorEntities[decoratorName])
        }
        const decoratorEntity = this.options.createWithDecoratorConfig?.(config)
        if (decoratorEntity !== undefined) {
          this.decoratorEntities[decoratorName] = decoratorEntity
        }
      }
    }))

    const decoratorConfig = getGuardConfig(decoratorName)

    if (decoratorConfig?.config !== undefined) {
      const decoratorEntity = this.options.createWithDecoratorConfig?.(decoratorConfig.config)
      if (this.decoratorEntities[decoratorName] !== undefined) {
        void this.options.cleanup(this.decoratorEntities[decoratorName])
      }
      if (decoratorEntity !== undefined) {
        this.decoratorEntities[decoratorName] = decoratorEntity
      }
      return decoratorEntity
    }

    return undefined
  }
}
