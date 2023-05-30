import type { StanzaCoreConfig } from '@getstanza/core'

const key = process.env.NEXT_PUBLIC_STANZA_BROWSER_KEY

if (typeof key !== 'string') {
  throw new Error('NEXT_PUBLIC_STANZA_BROWSER_KEY is a required environment variable')
}

export const config: StanzaCoreConfig = {
  url: process.env.NEXT_PUBLIC_STANZA_API ?? 'https://hub.demo.getstanza.io',
  environment: process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local',
  stanzaApiKey: key,
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

}
