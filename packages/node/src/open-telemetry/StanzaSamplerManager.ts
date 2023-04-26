import { type Context } from '@opentelemetry/api'
import { AlwaysOffSampler, type Sampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { stanzaDecoratorContextKey } from '../context/stanzaDecoratorContextKey'
import { addDecoratorConfigListener, getDecoratorConfig } from '../global/decoratorConfig'
import { addServiceConfigListener, getServiceConfig } from '../global/serviceConfig'
import { type ServiceConfig } from '../hub/model'

export class StanzaSamplerManager {
  private serviceSampler: Sampler = new AlwaysOffSampler()
  private readonly decoratorSamplers: Record<string, Sampler> = {}
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener(({ config: { traceConfig } }) => {
    this.updateServiceSampler(traceConfig)
  })

  private readonly unsubscribeDecoratorConfigListeners: Array<() => void> = []

  constructor () {
    const serviceConfig = getServiceConfig()
    if (serviceConfig?.config?.traceConfig !== undefined) {
      this.updateServiceSampler(serviceConfig.config.traceConfig)
    }
  }

  getSampler (context: Context): Sampler {
    return this.getDecoratorSampler(context) ?? this.serviceSampler
  }

  shutdown () {
    this.unsubscribeServiceConfigListener()
    this.unsubscribeDecoratorConfigListeners.forEach(unsubscribe => { unsubscribe() })
  }

  private updateServiceSampler (traceConfig: ServiceConfig['config']['traceConfig']) {
    // void this.serviceSampler.()
    this.serviceSampler = new TraceIdRatioBasedSampler(traceConfig.sampleRateDefault)
  }

  private getDecoratorSampler (context: Context): Sampler | undefined {
    const decoratorContextValue = context.getValue(stanzaDecoratorContextKey)
    const decoratorName = typeof (decoratorContextValue) === 'string' ? decoratorContextValue : undefined
    const decoratorProcessor = this.decoratorSamplers[decoratorName ?? '']

    if (decoratorProcessor !== undefined || decoratorName === undefined) {
      return decoratorProcessor
    }

    this.unsubscribeDecoratorConfigListeners.push(addDecoratorConfigListener(decoratorName, ({ config: { traceConfig } }) => {
      if (traceConfig !== undefined) {
        this.decoratorSamplers[decoratorName] = new TraceIdRatioBasedSampler(traceConfig.sampleRateDefault)
      }
    }))

    const decoratorConfig = getDecoratorConfig(decoratorName)

    if (decoratorConfig?.config?.traceConfig !== undefined) {
      const decoratorSampler = new TraceIdRatioBasedSampler(decoratorConfig.config.traceConfig.sampleRateDefault)
      this.decoratorSamplers[decoratorName] = decoratorSampler
      return decoratorSampler
    }

    return undefined
  }
}
