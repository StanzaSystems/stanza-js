import { type Attributes, type Context, type Link, type SpanKind } from '@opentelemetry/api'
import { ParentBasedSampler, type Sampler, type SamplingResult, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node'
import { type ServiceConfig } from '../../hub/model'
import { logger } from '../../global/logger'

export class StanzaConfiguredSampler implements Sampler {
  private readonly defaultSampler: Sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(this.serviceConfig.traceConfig.sampleRateDefault)
  })

  private readonly overrideSamplers: Record<number, Sampler> = {}

  constructor (private readonly serviceConfig: ServiceConfig['config']) {}

  shouldSample (context: Context, traceId: string, spanName: string, spanKind: SpanKind, attributes: Attributes, links: Link[]): SamplingResult {
    return this.chooseSampler(context, attributes).shouldSample(context, traceId, spanName, spanKind, attributes, links)
  }

  private chooseSampler (context: Context, attributes: Attributes) {
    logger.info('choosing sampler for attrs %o', attributes)
    logger.info('context value %s', context.getValue(Symbol.for('foo')))
    const matchingOverride = this.serviceConfig.traceConfig.overrides.find((override) => {
      return override.spanSelectors.every(({ otelAttribute, value }) => {
        return attributes[otelAttribute] === value
      })
    })

    if (matchingOverride !== undefined) {
      const overrideSampler = this.overrideSamplers[matchingOverride.sampleRate] = this.overrideSamplers[matchingOverride.sampleRate] ?? new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(matchingOverride.sampleRate)
      })

      return overrideSampler
    }

    return this.defaultSampler
  }
}
