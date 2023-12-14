import { z } from 'zod';
import type pino from 'pino';
import { type HubService } from '@getstanza/hub-client-api';

const LOG_LEVELS = Object.keys({
  fatal: true,
  error: true,
  warn: true,
  info: true,
  debug: true,
  trace: true,
} satisfies Record<pino.Level, true>) as pino.Level[];

export const stanzaInitOptions = z.object({
  hubUrl: z.string().url().describe('string (URL to a Hub instance)'),
  apiKey: z.string().describe('string (API key for a Hub instance)'),
  serviceName: z.string().describe('string (Name of the service)'),
  serviceRelease: z.string().describe('string (A version of the service)'),
  environment: z.string().describe('string (An environment to use)'),
  useRestHubApi: z.boolean().optional().default(false),
  skipTokenCache: z.boolean().optional().default(false),
  requestTimeout: z.number().int().optional().default(1000),
  logLevel: z
    .union(
      LOG_LEVELS.map((v) => z.literal(v)) as [
        z.ZodLiteral<pino.Level>,
        z.ZodLiteral<pino.Level>,
        ...Array<z.ZodLiteral<pino.Level>>,
      ]
    )
    .optional(),
});

type StanzaBaseInitOptions = z.infer<typeof stanzaInitOptions>;
export type StanzaInitOptions = StanzaBaseInitOptions & {
  createHubService: (
    options: StanzaBaseInitOptions & {
      clientId: string;
      logger: pino.Logger;
      getRequestTimeout: () => number;
    }
  ) => HubService;
};
