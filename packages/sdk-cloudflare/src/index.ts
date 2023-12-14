import {
  init as initBase,
  initOrThrow as initOrThrowBase,
  type Scheduler,
} from '@getstanza/sdk-base';
import {
  createHubRequest,
  createRestHubService,
} from '@getstanza/hub-client-http';

export * from '@getstanza/sdk-base';

type InitBaseOptions = Parameters<typeof initBase>[0];
type InitOptions = Omit<InitBaseOptions, 'createHubService' | 'useRestHubApi'>;

function createInitBaseOptions(options: InitOptions): InitBaseOptions {
  return {
    ...options,
    createHubService: (initOptions) =>
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
      }),
  };
}

export async function init(options: InitOptions, scheduler: Scheduler) {
  await initBase(createInitBaseOptions(options), scheduler);
}

export async function initOrThrow(options: InitOptions, scheduler: Scheduler) {
  await initOrThrowBase(createInitBaseOptions(options), scheduler);
}
