import type { InitOptions } from './types';
import {
  StanzaApiKeyPropagator,
  StanzaBaggagePropagator,
  stanzaGuard,
  StanzaTokenPropagator,
  TraceConfigOverrideAdditionalInfoPropagator,
} from '@getstanza/sdk-base';
import { context, propagation } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from './opentelemetry-context-async-hooks/AsyncLocalStorageContextManager';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { cloudflareScheduler } from './cloudflareScheduler';
import { headersGetter } from './headersGetter';
import { init } from './index';

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
      guard = stanzaGuard({
        guard: guardOptions.guardName,
        feature: 'featured',
      });
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
