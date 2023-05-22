import { z } from 'zod'

export const stanzaInitOptions = z.object({
  hubUrl: z.string().url(),
  apiKey: z.string(),
  serviceName: z.string(),
  serviceRelease: z.string(),
  environment: z.string()
})

export type StanzaInitOptions = z.infer<typeof stanzaInitOptions>
