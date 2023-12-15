import { type Context } from '@opentelemetry/api';
import { AlwaysOffSampler, type Sampler } from '@opentelemetry/sdk-trace-base';
import { StanzaConfigEntityManager } from '@getstanza/sdk-base';
import { type SamplerManager } from './SamplerManager';
import { StanzaConfiguredSampler } from './StanzaConfiguredSampler';

export class StanzaSamplerManager implements SamplerManager {
  private readonly traceConfigManager = new StanzaConfigEntityManager<Sampler>({
    getInitial: () => new AlwaysOffSampler(),
    createWithServiceConfig: (serviceConfig) =>
      new StanzaConfiguredSampler(serviceConfig),
    cleanup: async () => {},
  });

  getSampler(context: Context): Sampler {
    return this.traceConfigManager.getEntity(context);
  }

  async shutdown() {
    await this.traceConfigManager.shutdown();
  }
}
