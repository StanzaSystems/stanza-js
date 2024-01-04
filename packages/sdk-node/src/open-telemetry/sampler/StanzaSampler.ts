import { type Sampler } from '@opentelemetry/sdk-trace-base';
import { ManagedSampler } from './ManagedSampler';
import { StanzaSamplerManager } from './StanzaSamplerManager';

export class StanzaSampler extends ManagedSampler implements Sampler {
  constructor() {
    super(new StanzaSamplerManager());
  }
}
