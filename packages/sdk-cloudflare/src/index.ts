import {
  init as initBase,
  initOrThrow as initOrThrowBase,
  stanzaGuard,
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
  options: InitOptions,
  guardOptions: { guardName: string },
  cloudflareHandler: ExportedHandler
): typeof cloudflareHandler => {
  let initialized = false;
  let guard: ReturnType<typeof stanzaGuard<[], Response | Promise<Response>>>;

  const initIfNeeded = async (
    env: any // TODO: remove any
  ) => {
    if (!initialized) {
      initialized = true;

      const apiKey = env.STANZA_API_KEY;
      const hubUrl = env.STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co';
      const environment = env.STANZA_ENVIRONMENT ?? 'local';
      await init({ ...options, apiKey, hubUrl, environment });
      guard = stanzaGuard({ guard: guardOptions.guardName });
    }
  };

  const { fetch: fetchHandler, scheduled: scheduledHandler } =
    cloudflareHandler;
  return {
    ...cloudflareHandler,
    ...(fetchHandler !== undefined
      ? {
          fetch: async (request, env, ctx) => {
            await initIfNeeded(env);

            ctx.waitUntil(cloudflareScheduler.tick());
            try {
              const fn = async () => {
                return fetchHandler.call(cloudflareHandler, request, env, ctx);
              };
              return await guard.call(fn);
            } catch {
              return new Response('Too many requests', { status: 429 });
            }
          },
        }
      : {}),
    ...(scheduledHandler !== undefined
      ? {
          scheduled: async (controller, env, ctx) => {
            await initIfNeeded(env);

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
