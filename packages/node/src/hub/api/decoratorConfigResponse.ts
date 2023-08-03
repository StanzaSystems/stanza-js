import { z } from 'zod'

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
    validateIngressTokens: z.boolean()
  })
})
export const decoratorConfigResponse = z.union(
  [decoratorConfigWithData, decoratorConfigNoData]
)

export type DecoratorConfigResponse = z.infer<typeof decoratorConfigResponse>
