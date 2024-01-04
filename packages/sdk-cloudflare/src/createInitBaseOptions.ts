import { type InitBaseOptions, type InitOptions } from './types';
import {
  createHubRequest,
  createRestHubService,
} from '@getstanza/hub-client-http';
import { sdkOptions } from './sdkOptions';

export function createInitBaseOptions(options: InitOptions): InitBaseOptions {
  return {
    ...options,
    createHubService: (initOptions) =>
      createRestHubService({
        serviceName: initOptions.serviceName,
        serviceRelease: initOptions.serviceRelease,
        environment: initOptions.environment,
        clientId: initOptions.clientId,
        hubRequest: createHubRequest({
          ...sdkOptions,
          hubUrl: initOptions.hubUrl,
          apiKey: initOptions.apiKey,
          serviceName: initOptions.serviceName,
          serviceRelease: initOptions.serviceRelease,
          logger: initOptions.logger,
          getRequestTimeout: initOptions.getRequestTimeout,
        }),
        logger: initOptions.logger,
      }),
  };
}
