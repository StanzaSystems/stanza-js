import { z } from 'zod'

const stanzaTokenLease = z.object({
  durationMsec: z.number().int(),
  feature: z.string(),
  priorityBoost: z.number().int(),
  token: z.string()
})

export const stanzaTokenLeaseResponse = z.object({
  leases: z.array(stanzaTokenLease)
})

export type StanzaTokenLeaseResponse = z.infer<typeof stanzaTokenLeaseResponse>
