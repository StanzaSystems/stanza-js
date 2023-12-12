import { addInstrumentation } from './addInstrumentation';
import { generateClientId } from './generateClientId';
import { getEnvInitOptions } from './getEnvInitOptions';
import { updateHubService } from './global/hubService';
import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions';
import { startPollingServiceConfig } from './service/startPollingConfigService';
// import { createGrpcHubService } from './hub/grpc/createGrpcHubService';
// import { createHubRequest } from './hub/rest/createHubRequest';
// import { createRestHubService } from './hub/rest/createRestHubService';
import { setRequestTimeout } from './global/requestTimeout';
import { setSkipTokenCache } from './global/skipTokenCache';
import { logger } from './global/logger';
import { startPollingAuthToken } from './authentication/startPollingAuthToken';
import { type Scheduler } from './utils/scheduler';

export const initOrThrow = async (
  options: Partial<StanzaInitOptions> = {},
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
  if (initOptions.logLevel !== undefined) {
    logger.level = initOptions.logLevel;
  }

  await addInstrumentation(initOptions.serviceName, initOptions.serviceRelease);

  updateHubService(
    await Promise.all([
      import('./hub/rest/createRestHubService'),
      import('./hub/rest/createHubRequest'),
    ]).then(([module1, module2]) =>
      module1.createRestHubService({
        serviceName: initOptions.serviceName,
        serviceRelease: initOptions.serviceRelease,
        environment: initOptions.environment,
        clientId,
        hubRequest: module2.createHubRequest({
          hubUrl: initOptions.hubUrl,
          apiKey: initOptions.apiKey,
          serviceName: initOptions.serviceName,
          serviceRelease: initOptions.serviceRelease,
        }),
      })
    )
    // initOptions.useRestHubApi
    //   ? createRestHubService({
    //     serviceName: initOptions.serviceName,
    //     serviceRelease: initOptions.serviceRelease,
    //     environment: initOptions.environment,
    //     clientId,
    //     hubRequest: createHubRequest({
    //       hubUrl: initOptions.hubUrl,
    //       apiKey: initOptions.apiKey,
    //       serviceName: initOptions.serviceName,
    //       serviceRelease: initOptions.serviceRelease
    //     })
    //   })
    //   : createGrpcHubService({
    //     serviceName: initOptions.serviceName,
    //     serviceRelease: initOptions.serviceRelease,
    //     environment: initOptions.environment,
    //     clientId,
    //     hubUrl: initOptions.hubUrl,
    //     apiKey: initOptions.apiKey
    //   })
  );

  startPollingServiceConfig(clientId, scheduler);
  startPollingAuthToken(scheduler);
};
