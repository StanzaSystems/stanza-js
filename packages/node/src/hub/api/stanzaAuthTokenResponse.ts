import { z } from 'zod'

export const stanzaAuthTokenResponse = z.object({
  bearerToken: z.string()
})

export type StanzaAuthTokenResponse = z.infer<typeof stanzaAuthTokenResponse>
