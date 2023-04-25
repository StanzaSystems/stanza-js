import { AlwaysOffSampler, ParentBasedSampler, type Sampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { addServiceConfigListener } from '../global/serviceConfig'

export class StanzaSampler implements Sampler {
  private serviceSampler: Sampler = new AlwaysOffSampler()

  constructor () {
    addServiceConfigListener(({ config: { traceConfig } }) => {
      this.serviceSampler = new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(traceConfig.sampleRateDefault)
      })
    })
  }

  shouldSample (...args: Parameters<Sampler['shouldSample']>) {
    return this.serviceSampler.shouldSample(...args)
  }
}
