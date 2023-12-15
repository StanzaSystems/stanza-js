/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { stanzaCloudflareHandler } from '@getstanza/sdk-cloudflare';

const handler: ExportedHandler = stanzaCloudflareHandler(
  {
    serviceName: 'DemoCommerce',
    serviceRelease: '1',
    requestTimeout: 2000,
  },
  { guardName: 'Stripe_Products_API' },
  {
    // The fetch handler is invoked when this worker receives a HTTP(S) request
    // and should return a Response (optionally wrapped in a Promise)
    async fetch(request, env, ctx) {
      return fetch('https://zenquotes.io/api/random');
    },
    async scheduled(controller, env, ctx) {},
  }
);

// Export a default object containing event handlers
export default handler;
