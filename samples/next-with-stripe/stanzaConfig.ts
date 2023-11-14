import type { StanzaCoreConfig } from '@getstanza/browser'
import type { init } from '@getstanza/node'
type NodeConfig = Parameters<typeof init>[0]

const stanzaBrowserKey = process.env.NEXT_PUBLIC_STANZA_BROWSER_KEY

if (typeof stanzaBrowserKey !== 'string') {
  throw new Error(
    'The NEXT_PUBLIC_STANZA_BROWSER_KEY environment variable has not been set. It must be set to a valid key at build time for this sample application to work correctly.'
  )
}

const stanzaApiKey = process.env.NEXT_PUBLIC_STANZA_API_KEY

if (typeof stanzaApiKey !== 'string') {
  throw new Error(
    'NEXT_PUBLIC_STANZA_API_KEY is a required environment variable'
  )
}

const hubUrl =
  process.env.NEXT_PUBLIC_STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co'
const environment = process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local'
export const browserConfig = {
  url: hubUrl,
  environment,
  stanzaApiKey: stanzaBrowserKey,
  contextConfigs: [
    {
      name: 'main',
      features: ['featured', 'search', 'checkout']
    }
  ],
  refreshSeconds: 3,
  enablementNumberGenerator: async (): Promise<number> => {
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/enablementNumber')
      return response.json()
    }
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
