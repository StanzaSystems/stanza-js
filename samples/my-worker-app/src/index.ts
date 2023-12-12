/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import * as process from './env';

import { init, stanzaGuard } from '@getstanza/node';
import { scheduler } from './scheduler';

type NodeConfig = Parameters<typeof init>[0];

const stanzaApiKey = process.env.NEXT_PUBLIC_STANZA_API_KEY;

const hubUrl =
  process.env.NEXT_PUBLIC_STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co';
const environment = process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local';

export const nodeConfig = {
  hubUrl,
  environment,
  apiKey: stanzaApiKey,
  serviceName: 'DemoCommerce',
  serviceRelease: '1',
  useRestHubApi: true,
  requestTimeout: 2000,
} satisfies NodeConfig;

console.log('before init');

init(nodeConfig, scheduler).catch(() => {});

const guard = stanzaGuard<[], Response>(
  {
    guard: 'Stripe_Products_API',
  },
  scheduler
);

const handler: ExportedHandler<{ EXAMPLE_CLASS: DurableObjectNamespace }> = {
  // The fetch handler is invoked when this worker receives a HTTP(S) request
  // and should return a Response (optionally wrapped in a Promise)
  async fetch(request, env, ctx) {
    ctx.waitUntil(scheduler.tick());
    try {
      const fn = () => {
        return new Response('hello');
      };
      return await guard.call(fn);
    } catch {
      return new Response('Too many requests', { status: 429 });
    }
  },
  async scheduled(controller, env, ctx) {
    console.log('scheduled');
    ctx.waitUntil(scheduler.tick());
  },
};

// Export a default object containing event handlers
export default handler;
