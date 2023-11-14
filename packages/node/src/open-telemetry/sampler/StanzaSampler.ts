import { type Sampler } from '@opentelemetry/sdk-trace-node'
import { ManagedSampler } from './ManagedSampler'
import { StanzaSamplerManager } from './StanzaSamplerManager'

export class StanzaSampler extends ManagedSampler implements Sampler {
  constructor() {
    super(new StanzaSamplerManager())
  }
}
