import { z } from 'zod'

const getTokenGranted = z.object({
  granted: z.literal(true),
  token: z.string()
})
const getTokenRejected = z.object({
  granted: z.literal(false)
})

export const getToken = z.union([getTokenGranted, getTokenRejected])

export type GetTokenResponse = z.infer<typeof getToken>
