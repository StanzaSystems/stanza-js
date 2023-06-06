import { z } from 'zod'

const zNonStrictObject = z.object({}).nonstrict()
const zTraceConfig = z.object({
  collectorUrl: z.string(),
  sampleRateDefault: z.number(),
  overrides: z.array(zNonStrictObject)
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
