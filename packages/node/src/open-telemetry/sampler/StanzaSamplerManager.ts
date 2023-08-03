import { type Context } from '@opentelemetry/api'
import { AlwaysOffSampler, type Sampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { StanzaConfigEntityManager } from '../StanzaConfigEntityManager'
import { type SamplerManager } from './SamplerManager'

export class StanzaSamplerManager implements SamplerManager {
  private readonly traceConfigManager = new StanzaConfigEntityManager<Sampler>({
    getInitial: () => new AlwaysOffSampler(),
    createWithServiceConfig: ({ traceConfig }) => new TraceIdRatioBasedSampler(traceConfig.sampleRateDefault),
    cleanup: async () => {}
  })

  getSampler (context: Context): Sampler {
    return this.traceConfigManager.getEntity(context)
  }

  async shutdown () {
    await this.traceConfigManager.shutdown()
  }
}
