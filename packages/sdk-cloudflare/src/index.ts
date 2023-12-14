import {
  init as initBase,
  initOrThrow as initOrThrowBase,
} from '@getstanza/sdk-base';
import {
  createHubRequest,
  createRestHubService,
} from '@getstanza/hub-client-http';
import { cloudflareScheduler } from './cloudflareScheduler';

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

export async function init(options: InitOptions) {
  await initBase(createInitBaseOptions(options), cloudflareScheduler);
}

export async function initOrThrow(options: InitOptions) {
  await initOrThrowBase(createInitBaseOptions(options), cloudflareScheduler);
}

export const stanzaCloudflareHandler = (
  cloudflareHandler: ExportedHandler
): typeof cloudflareHandler => {
  const { fetch: fetchHandler, scheduled: scheduledHandler } =
    cloudflareHandler;
  return {
    ...cloudflareHandler,
    ...(fetchHandler !== undefined
      ? {
          fetch: async (request, env, ctx) => {
            ctx.waitUntil(cloudflareScheduler.tick());
            return fetchHandler.call(cloudflareHandler, request, env, ctx);
          },
        }
      : {}),
    ...(scheduledHandler !== undefined
      ? {
          scheduled: async (controller, env, ctx) => {
            ctx.waitUntil(cloudflareScheduler.tick());
            return scheduledHandler.call(
              cloudflareHandler,
              controller,
              env,
              ctx
            );
          },
        }
      : {}),
  };
};
