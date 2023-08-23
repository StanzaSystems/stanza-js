import { type Context } from '@opentelemetry/api'
import { stanzaGuardContextKey } from '../context/stanzaGuardContextKey'
import { addGuardConfigListener, getGuardConfig } from '../global/guardConfig'
import { addServiceConfigListener, getServiceConfig } from '../global/serviceConfig'
import { type GuardConfig, type ServiceConfig } from '../hub/model'

export class StanzaConfigEntityManager<T> {
  private serviceEntity: T
  private readonly guardEntities: Record<string, T> = {}
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener((serviceConfig) => {
    serviceConfig !== undefined && this.updateServiceEntity(serviceConfig.config)
  })

  private readonly unsubscribeGuardConfigListeners: Array<() => void> = []

  constructor (
    private readonly options: {
      getInitial: () => T
      createWithServiceConfig: (serviceConfig: NonNullable<ServiceConfig['config']>) => T
      createWithGuardConfig?: (guardConfig: NonNullable<GuardConfig['config']>) => T | undefined
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
    const guardEntity = this.getGuardEntity(context)
    return guardEntity ?? this.serviceEntity
  }

  async shutdown (): Promise<void> {
    this.unsubscribeServiceConfigListener()
    this.unsubscribeGuardConfigListeners.forEach(u => { u() })
    await Promise.all(this.getAllEntities().map(async entity => this.options.cleanup(entity)))
  }

  getAllEntities (): T[] {
    return [
      this.serviceEntity,
      ...Object.values(this.guardEntities).flat() as T[]
    ]
  }

  private updateServiceEntity (serviceConfig: NonNullable<ServiceConfig['config']>) {
    this.serviceEntity = this.options.createWithServiceConfig(serviceConfig)
  }

  private getGuardEntity (context: Context): T | undefined {
    const guardContextValue = context.getValue(stanzaGuardContextKey)
    const guardName = typeof (guardContextValue) === 'string' ? guardContextValue : undefined
    const guardProcessor = this.guardEntities[guardName ?? '']

    if (guardProcessor !== undefined || guardName === undefined) {
      return guardProcessor
    }

    this.unsubscribeGuardConfigListeners.push(addGuardConfigListener(guardName, ({ config }) => {
      if (config !== undefined) {
        if (this.guardEntities[guardName] !== undefined) {
          void this.options.cleanup(this.guardEntities[guardName])
        }
        const guardEntity = this.options.createWithGuardConfig?.(config)
        if (guardEntity !== undefined) {
          this.guardEntities[guardName] = guardEntity
        }
      }
    }))

    const guardConfig = getGuardConfig(guardName)

    if (guardConfig?.config !== undefined) {
      const guardEntity = this.options.createWithGuardConfig?.(guardConfig.config)
      if (this.guardEntities[guardName] !== undefined) {
        void this.options.cleanup(this.guardEntities[guardName])
      }
      if (guardEntity !== undefined) {
        this.guardEntities[guardName] = guardEntity
      }
      return guardEntity
    }

    return undefined
  }
}
