import { type Sampler } from '@opentelemetry/sdk-trace-node'
import { type SamplerManager } from './SamplerManager'

export class ManagedSampler implements Sampler {
  constructor(private readonly samplerManager: SamplerManager) {}

  shouldSample(...args: Parameters<Sampler['shouldSample']>) {
    const [context] = args
    return this.samplerManager.getSampler(context).shouldSample(...args)
  }
}
