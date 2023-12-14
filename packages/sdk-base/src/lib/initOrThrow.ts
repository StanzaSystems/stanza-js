import { addInstrumentation } from './addInstrumentation';
import { generateClientId } from './generateClientId';
import { getEnvInitOptions } from './getEnvInitOptions';
import { updateHubService } from './global/hubService';
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions';
import { startPollingServiceConfig } from './service/startPollingConfigService';
import {
  setRequestTimeout,
  STANZA_REQUEST_TIMEOUT,
} from './global/requestTimeout';
import { setSkipTokenCache } from './global/skipTokenCache';
import { logger } from './global/logger';
import { startPollingAuthToken } from './authentication/startPollingAuthToken';
import { type Scheduler } from './utils/scheduler';
import { setScheduler } from './global/scheduler';
import { type HubService } from '@getstanza/hub-client-api';
import { wrapHubServiceWithMetrics } from './hub/wrapHubServiceWithMetrics';

export const initOrThrow = async (
  options: Partial<StanzaInitOptions> &
    Pick<StanzaInitOptions, 'createHubService'>,
  scheduler?: Scheduler
) => {
  const parseResult = stanzaInitOptions.safeParse({
    ...getEnvInitOptions(),
    ...options,
  });

  if (!parseResult.success) {
    const expectedFields = stanzaInitOptions
      .keyof()
      .options.map((option) => ({
        key: option,
        value: stanzaInitOptions.shape[option],
      }))
      .filter(({ value }) => value.description)
      .map(({ key, value }) => `- ${key}: ${value.description}`)
      .join('\n');

    throw new TypeError(
      `Provided options are invalid. Please provide an object with the following properties:\n${expectedFields}`
    );
  }
  const initOptions = parseResult.data;
  const clientId = generateClientId();

  setRequestTimeout(initOptions.requestTimeout);
  setSkipTokenCache(initOptions.skipTokenCache);
  scheduler !== undefined && setScheduler(scheduler);
  if (initOptions.logLevel !== undefined) {
    logger.level = initOptions.logLevel;
  }

  await addInstrumentation(initOptions.serviceName, initOptions.serviceRelease);

  updateHubService(
    wrapHubService(
      options.createHubService({
        ...initOptions,
        clientId,
        logger,
        getRequestTimeout: () => STANZA_REQUEST_TIMEOUT,
      })
      // initOptions.useRestHubApi
      //   ? await import('@getstanza/hub-client-http').then(
      //       ({ createRestHubService, createHubRequest }) =>
      //         createRestHubService({
      //           serviceName: initOptions.serviceName,
      //           serviceRelease: initOptions.serviceRelease,
      //           environment: initOptions.environment,
      //           clientId,
      //           hubRequest: createHubRequest({
      //             hubUrl: initOptions.hubUrl,
      //             apiKey: initOptions.apiKey,
      //             serviceName: initOptions.serviceName,
      //             serviceRelease: initOptions.serviceRelease,
      //             logger,
      //             getRequestTimeout: () => STANZA_REQUEST_TIMEOUT,
      //           }),
      //           logger,
      //         })
      //     )
      //   : await Promise.resolve().then(async () => {
      //       console.warn('loading grpc');
      //       throw 'kaboom';
      //
      //       // return import('@getstanza/hub-client-grpc').then(
      //       //   ({ createGrpcHubService }) =>
      //       //     createGrpcHubService({
      //       //       serviceName: initOptions.serviceName,
      //       //       serviceRelease: initOptions.serviceRelease,
      //       //       environment: initOptions.environment,
      //       //       clientId,
      //       //       hubUrl: initOptions.hubUrl,
      //       //       apiKey: initOptions.apiKey,
      //       //       logger,
      //       //       getRequestTimeout: () => STANZA_REQUEST_TIMEOUT,
      //       //     })
      //       // );
      //     })
    )
  );

  startPollingServiceConfig(clientId);
  startPollingAuthToken();
};

const wrapHubService = (hubService: HubService): HubService => {
  return wrapHubServiceWithMetrics(
    logger.wrap(
      {
        prefix: '[Hub Service]',
      },
      hubService
    )
  );
};
