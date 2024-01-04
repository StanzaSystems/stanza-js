import { type z, type ZodType } from 'zod';
import { withTimeout, createUserAgentHeader } from '@getstanza/sdk-utils';
import { fetch } from './fetchImplementation';
import { type HubApiPath, type HubRequest } from './hubRequest';
import type pino from 'pino';

export interface HubRequestInitOptions {
  hubUrl: string;
  apiKey: string;
  serviceName: string;
  serviceRelease: string;
  sdkName: string;
  sdkVersion: string;
  logger: pino.Logger;
  getRequestTimeout: () => number;
}

export const createHubRequest = ({
  apiKey,
  hubUrl,
  serviceName,
  serviceRelease,
  sdkName,
  sdkVersion,
  logger,
  getRequestTimeout,
}: HubRequestInitOptions): HubRequest => {
  return async function hubRequest<T extends ZodType>(
    apiPath: HubApiPath,
    params: {
      method?: string;
      searchParams?: Record<string, string | string[] | undefined>;
      body?: unknown;
    },
    validateRequest: T
  ): Promise<z.infer<T> | null> {
    const requestUrl = new URL(`${hubUrl}/${apiPath}`);

    const { method = 'GET', searchParams = {}, body } = params;

    Object.entries(searchParams)
      .map(([key, value]) =>
        typeof value === 'object'
          ? value.map((v) => [key, v] as const)
          : [[key, value] as const]
      )
      .flat(1)
      .filter((entry): entry is [string, string] => {
        const [key, value] = entry;
        return key !== '' && value !== undefined;
      })
      .forEach(([key, value]) => {
        requestUrl.searchParams.append(key, value);
      });

    const response = await withTimeout(
      getRequestTimeout(),
      'Hub request timed out',
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey,
          'User-Agent': createUserAgentHeader({
            serviceName,
            serviceRelease,
            sdkName,
            sdkVersion,
          }),
        },
        method,
        ...(body != null ? { body: JSON.stringify(body) } : {}),
      })
    );

    const data = await response.json();

    const parsedResult = validateRequest.safeParse(data);

    if (!parsedResult.success) {
      logger.debug(
        'request to hub (%s) failed %o',
        requestUrl,
        parsedResult.error
      );
      logger.debug('raw response: %o', data);
      return null;
    }

    return parsedResult.data;
  };
};
