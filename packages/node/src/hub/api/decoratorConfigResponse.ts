import { z } from 'zod'

const zNonStrictObject = z.object({}).nonstrict()
const zTraceConfig = z.object({
  collectorUrl: z.string(),
  collectorKey: z.string(),
  sampleRateDefault: z.number(),
  overrides: z.array(zNonStrictObject)
})
const decoratorConfigNoData = z.object({
  version: z.string(),
  configDataSent: z.literal(false),
  config: z.null().optional()
})

const decoratorConfigWithData = z.object({
  version: z.string(),
  configDataSent: z.literal(true),
  config: z.object({
    checkQuota: z.boolean(),
    quotaTags: z.array(z.string()),
    validateIngressTokens: z.boolean(),
    traceConfig: zTraceConfig.optional()
  })
})
export const decoratorConfigResponse = z.union(
  [decoratorConfigWithData, decoratorConfigNoData]
)

export type DecoratorConfigResponse = z.infer<typeof decoratorConfigResponse>
