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
    decoratorConfig: z.string(),
    environment: z.string(),
    checkQuota: z.boolean(),
    strictSynchronousQuota: z.boolean(),
    quotaTags: z.array(z.string()),
    validateIngressTokens: z.boolean(),
    traceConfig: zTraceConfig
  })
})
export const decoratorConfig = z.union(
  [decoratorConfigWithData, decoratorConfigNoData]
)

export type DecoratorConfigResult = z.infer<typeof decoratorConfig>
