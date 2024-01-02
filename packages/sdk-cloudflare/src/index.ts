import {
  init as initBase,
  initOrThrow as initOrThrowBase,
  StanzaApiKeyPropagator,
  StanzaBaggagePropagator,
  stanzaGuard,
  StanzaTokenPropagator,
  TraceConfigOverrideAdditionalInfoPropagator,
} from '@getstanza/sdk-base';
import {
  createHubRequest,
  createRestHubService,
} from '@getstanza/hub-client-http';
import { cloudflareScheduler } from './cloudflareScheduler';
import { context, propagation, type TextMapGetter } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { AsyncLocalStorageContextManager } from './opentelemetry-context-async-hooks/AsyncLocalStorageContextManager';

export * from '@getstanza/sdk-base';

type InitBaseOptions = Parameters<typeof initBase>[0];
type InitOptions = Omit<
  InitBaseOptions,
  'createHubService' | 'useRestHubApi'
> & { scheduler?: { tickSize?: number } };

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

const headersGetter: TextMapGetter = {
  get(carrier, key) {
    if (carrier == null) {
      return undefined;
    }
    return carrier.get(key) ?? undefined;
  },
  keys(carrier) {
    if (carrier == null) {
      return [];
    }
    return Array.from(carrier.keys());
  },
};

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
      context.setGlobalContextManager(new AsyncLocalStorageContextManager());
      propagation.setGlobalPropagator(
        new CompositePropagator({
          propagators: [
            new W3CTraceContextPropagator(),
            new StanzaBaggagePropagator(),
            new StanzaApiKeyPropagator(),
            new StanzaTokenPropagator(),
            new TraceConfigOverrideAdditionalInfoPropagator(),
          ],
        })
      );
    }
  };

  const { fetch: fetchHandler, scheduled: scheduledHandler } =
    cloudflareHandler;
  return {
    ...cloudflareHandler,
    ...(fetchHandler !== undefined
      ? {
          fetch: async (request, env, ctx): Promise<Response> => {
            await initIfNeeded(env);

            ctx.waitUntil(
              cloudflareScheduler.runScheduled(options.scheduler?.tickSize)
            );

            const fetchContext = propagation.extract(
              context.active(),
              request.headers,
              headersGetter
            );
            return context.with(fetchContext, async () => {
              try {
                const fn = (): Promise<Response> | Response => {
                  return fetchHandler.call(
                    cloudflareHandler,
                    request,
                    env,
                    ctx
                  );
                };
                return await guard.call(fn);
              } catch {
                return new Response('Too many requests', { status: 429 });
              }
            });
          },
        }
      : {}),
    ...(scheduledHandler !== undefined
      ? {
          scheduled: async (controller, env, ctx) => {
            await initIfNeeded(env);

            ctx.waitUntil(
              cloudflareScheduler.runScheduled(options.scheduler?.tickSize)
            );

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
