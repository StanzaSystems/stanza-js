import { z } from 'zod'

const guardConfigNoData = z.object({
  version: z.string(),
  configDataSent: z.literal(false),
  config: z.null().optional()
})

const guardConfigWithData = z.object({
  version: z.string(),
  configDataSent: z.literal(true),
  config: z.object({
    checkQuota: z.boolean(),
    quotaTags: z.array(z.string()),
    validateIngressTokens: z.boolean(),
    reportOnly: z.boolean()
  })
})
export const guardConfigResponse = z.union([
  guardConfigWithData,
  guardConfigNoData
])

export type GuardConfigResponse = z.infer<typeof guardConfigResponse>
