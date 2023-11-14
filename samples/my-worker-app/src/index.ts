/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import * as process from './env'

import type { StanzaCoreConfig } from '@getstanza/browser'
import { init } from '@getstanza/node'
type NodeConfig = Parameters<typeof init>[0]

const stanzaBrowserKey = process.env.NEXT_PUBLIC_STANZA_BROWSER_KEY

const stanzaApiKey = process.env.NEXT_PUBLIC_STANZA_API_KEY

const hubUrl = process.env.NEXT_PUBLIC_STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co'
const environment = process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local'
export const browserConfig = {
  url: hubUrl,
  environment,
  stanzaApiKey: stanzaBrowserKey,
  contextConfigs: [
    {
      name: 'main',
      features: ['featured', 'search', 'checkout']
    },
    {
      name: 'details',
      features: ['checkout']
    }
  ],
  refreshSeconds: 3,
  enablementNumberGenerator: async (): Promise<number> => {
    return 100
  }
} satisfies StanzaCoreConfig

export const nodeConfig = {
  hubUrl,
  environment,
  apiKey: stanzaApiKey,
  serviceName: 'DemoCommerce',
  serviceRelease: '1',
  useRestHubApi: true,
  requestTimeout: 2000
} satisfies NodeConfig

console.log('dasdsjkdhjsh')

init(nodeConfig).catch(() => {})

const handler: ExportedHandler = {
  // The fetch handler is invoked when this worker receives a HTTP(S) request
  // and should return a Response (optionally wrapped in a Promise)
  async fetch (request, env, ctx) {
    // const proxyUrl = new URL('https://zenquotes.io')
    // return stanza.guard(proxyUrl, request, env, ctx)
    return new Response('hello')
  }
}

// Export a default object containing event handlers
export default handler

// init({
//   // remaining Stanza init configuration
//   useRestHubApi: true
// }).catch(() => {})
