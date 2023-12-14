import { type StanzaInitOptions } from './stanzaInitOptions';
import {
  type CoerceFn,
  coerceStringToBoolean,
  coerceStringToInteger,
  coerceStringToLogLevel,
} from './coerceStanzaInitOptions';
import { identity } from '@getstanza/core';
import process from 'node:process';

type StanzaInitOptionsFromEnv = Exclude<
  keyof StanzaInitOptions,
  'useRestHubApi' | 'createHubService'
>;

const stanzaEnvOptionsMap: {
  [P in StanzaInitOptionsFromEnv]: [string, CoerceFn<P>];
} = {
  hubUrl: ['STANZA_HUB_ADDRESS', identity],
  apiKey: ['STANZA_API_KEY', identity],
  serviceName: ['STANZA_SERVICE_NAME', identity],
  serviceRelease: ['STANZA_SERVICE_RELEASE', identity],
  environment: ['STANZA_ENVIRONMENT', identity],
  skipTokenCache: ['STANZA_SKIP_TOKEN_CACHE', coerceStringToBoolean],
  requestTimeout: ['STANZA_REQUEST_TIMEOUT', coerceStringToInteger],
  logLevel: ['STANZA_LOG_LEVEL', coerceStringToLogLevel],
};
export const getEnvInitOptions = (): Partial<StanzaInitOptions> => {
  return (
    Object.entries(stanzaEnvOptionsMap) as Array<
      [StanzaInitOptionsFromEnv, [string, CoerceFn<any>]]
    >
  ).reduce<Partial<StanzaInitOptions>>(
    (resultOptions, [optionKey, [envKey, coerceFn]]) => {
      resultOptions[optionKey] = coerceFn(process.env[envKey]);
      return resultOptions;
    },
    {}
  );
};
