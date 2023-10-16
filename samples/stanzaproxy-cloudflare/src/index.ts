/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import stanza from './proxy';

// import { init } from '@getstanza/node'
// init({
//   // remaining Stanza init configuration
//   useRestHubApi: true
// }).catch(() => {})

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const proxyUrl = new URL('https://zenquotes.io')
		return stanza.guard(proxyUrl, request, env, ctx);
	},
};
