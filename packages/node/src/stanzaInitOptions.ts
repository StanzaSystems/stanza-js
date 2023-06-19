import { z } from 'zod'
import type pino from 'pino'

const LOG_LEVELS = Object.keys({
  fatal: true, error: true, warn: true, info: true, debug: true, trace: true
} satisfies Record<pino.Level, true>) as pino.Level[]

export const stanzaInitOptions = z.object({
  hubUrl: z.string().url(),
  apiKey: z.string(),
  serviceName: z.string(),
  serviceRelease: z.string(),
  environment: z.string(),
  useRestHubApi: z.boolean().optional().default(false),
  skipTokenCache: z.boolean().optional().default(false),
  requestTimeout: z.number().int().optional().default(1000),
  logLevel: z.union(LOG_LEVELS.map(v => z.literal(v)) as [z.ZodLiteral<pino.Level>, z.ZodLiteral<pino.Level>, ...Array<z.ZodLiteral<pino.Level>>]).optional()
})

export type StanzaInitOptions = z.infer<typeof stanzaInitOptions>
