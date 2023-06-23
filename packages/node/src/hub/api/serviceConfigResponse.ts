import { z } from 'zod'

const zSpanSelector = z.object({
  otelAttribute: z.string(),
  value: z.string()
})

const zTraceConfigOverride = z.object({
  sampleRate: z.number(),
  spanSelectors: z.array(zSpanSelector)
})

const zHeaderTraceConfig = z.object({
  requestHeaderName: z.array(z.string()),
  responseHeaderName: z.array(z.string()),
  spanSelectors: z.array(zSpanSelector)
})

const zParamTraceConfig = z.object({
  parameterName: z.array(z.string()),
  spanSelectors: z.array(zSpanSelector)
})

const zTraceConfig = z.object({
  collectorUrl: z.string(),
  sampleRateDefault: z.number(),
  overrides: z.array(zTraceConfigOverride),
  headerSampleConfig: z.array(zHeaderTraceConfig).optional().default([]),
  paramSampleConfig: z.array(zParamTraceConfig).optional().default([])
})

const zMetricConfig = z.object({
  collectorUrl: z.string()
})

const zSentinelConfig = z.object({
  circuitbreakerRulesJson: z.string(),
  flowRulesJson: z.string(),
  isolationRulesJson: z.string(),
  systemRulesJson: z.string()
})

const serviceConfigNoData = z.object({
  version: z.string(),
  configDataSent: z.literal(false),
  config: z.null().optional()
})

const serviceConfigWithData = z.object({
  version: z.string(),
  configDataSent: z.literal(true),
  config: z.object({
    traceConfig: zTraceConfig,
    metricConfig: zMetricConfig,
    sentinelConfig: zSentinelConfig
  })
})
export const serviceConfigResponse = z.union(
  [serviceConfigWithData, serviceConfigNoData]
)

export type ServiceConfigResponse = z.infer<typeof serviceConfigResponse>
