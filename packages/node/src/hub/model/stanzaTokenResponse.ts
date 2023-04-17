import { z } from 'zod'

const getTokenGranted = z.object({
  granted: z.literal(true),
  token: z.string()
})
const getTokenRejected = z.object({
  granted: z.literal(false)
})

export const stanzaTokenResponse = z.union([getTokenGranted, getTokenRejected])

export type StanzaTokenResponse = z.infer<typeof stanzaTokenResponse>
