import {
  type Attributes,
  type Context,
  type Link,
  SpanKind,
} from '@opentelemetry/api';
import {
  ParentBasedSampler,
  type Sampler,
  type SamplingResult,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { type ServiceConfig } from '@getstanza/hub-client-api';
import { getTraceConfigOverrideAdditionalInfo } from '../../propagation/TraceConfigOverrideAdditionalInfoPropagator';

export class StanzaConfiguredSampler implements Sampler {
  private readonly defaultSampler: Sampler = new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(
      this.serviceConfig.traceConfig.sampleRateDefault
    ),
  });

  private readonly overrideSamplers: Record<number, Sampler> = {};

  constructor(private readonly serviceConfig: ServiceConfig['config']) {}

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[]
  ): SamplingResult {
    return this.chooseSampler(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links
    ).shouldSample(context, traceId, spanName, spanKind, attributes, links);
  }

  private chooseSampler(
    context: Context,
    _traceId: string,
    _spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    _links: Link[]
  ) {
    const { headers = {} } = getTraceConfigOverrideAdditionalInfo(context);

    const normalizedHeaders = Object.entries(headers).map(
      ([name, value]) => [name.toLowerCase().replace(/-/g, '_'), value] as const
    );

    const allAttributes = {
      ...attributes,
    };

    if (spanKind === SpanKind.CLIENT || spanKind === SpanKind.SERVER) {
      const type = spanKind === SpanKind.CLIENT ? 'client' : 'server';
      normalizedHeaders.forEach(([normalizeHeaderName, value]) => {
        const key = `http.${type}.header.${normalizeHeaderName}`;
        allAttributes[key] = value;
      }, {});
    }

    const matchingOverride = this.serviceConfig.traceConfig.overrides.find(
      (override) => {
        return override.spanSelectors.every(({ otelAttribute, value }) => {
          return allAttributes[otelAttribute] === value;
        });
      }
    );

    if (matchingOverride !== undefined) {
      const overrideSampler = (this.overrideSamplers[
        matchingOverride.sampleRate
      ] =
        this.overrideSamplers[matchingOverride.sampleRate] ??
        new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(matchingOverride.sampleRate),
        }));

      return overrideSampler;
    }

    return this.defaultSampler;
  }
}
