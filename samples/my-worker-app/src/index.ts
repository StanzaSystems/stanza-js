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
    async fetch(request, _env, _ctx) {
      const proxyUrl = new URL('https://zenquotes.io')
      const requestUrl = new URL(request.url);

      // carry through request path and query string
      proxyUrl.pathname = requestUrl.pathname;
      proxyUrl.search = requestUrl.search;

      // carry through original request headers (except for X-Stanza-Key)
      const proxyHeaders = new Headers(request.headers);
      proxyHeaders.delete('X-Stanza-Key');
      // TODO: pass Stanza token if obtained
      const proxyRequest = new Request(request, { headers: proxyHeaders });

      // make subrequests with the global `fetch()` function
      return  fetch(proxyUrl, proxyRequest);
    },
    async scheduled(_controller, _env, _ctx) {},
  }
);

// Export a default object containing event handlers
export default handler;
