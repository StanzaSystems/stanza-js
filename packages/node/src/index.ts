import {
  init as initBase,
  initOrThrow as initOrThrowBase,
} from '@getstanza/sdk-base';
import {
  createHubRequest,
  createRestHubService,
} from '@getstanza/hub-client-http';
import { createGrpcHubService } from '@getstanza/hub-client-grpc';

export * from '@getstanza/sdk-base';

type InitBaseOptions = Parameters<typeof initBase>[0];
type InitOptions = Omit<InitBaseOptions, 'createHubService'>;

function createInitBaseOptions(options: InitOptions): InitBaseOptions {
  return {
    ...options,
    createHubService:
      options.useRestHubApi === true
        ? (initOptions) =>
            createRestHubService({
              serviceName: initOptions.serviceName,
              serviceRelease: initOptions.serviceRelease,
              environment: initOptions.environment,
              clientId: initOptions.clientId,
              hubRequest: createHubRequest({
                hubUrl: initOptions.hubUrl,
                apiKey: initOptions.apiKey,
                serviceName: initOptions.serviceName,
                serviceRelease: initOptions.serviceRelease,
                logger: initOptions.logger,
                getRequestTimeout: initOptions.getRequestTimeout,
              }),
              logger: initOptions.logger,
            })
        : (initOptions) => createGrpcHubService(initOptions),
  };
}

export async function init(options: InitOptions) {
  await initBase(createInitBaseOptions(options));
}

export async function initOrThrow(options: InitOptions) {
  await initOrThrowBase(createInitBaseOptions(options));
}
