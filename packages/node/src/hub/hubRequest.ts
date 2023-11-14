import { type z, type ZodType } from 'zod';

export type HubApiPath = string;

export type HubRequest = <T extends ZodType>(
  apiPath: HubApiPath,
  params: {
    method?: string;
    searchParams?: Record<string, string | string[] | undefined>;
    body?: unknown;
  },
  validateRequest: T,
) => Promise<z.infer<T> | null>;
