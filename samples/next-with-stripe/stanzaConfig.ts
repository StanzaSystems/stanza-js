import type { StanzaCoreConfig } from '@getstanza/core'

export const config: StanzaCoreConfig = {
  url: process.env.NEXT_PUBLIC_STANZA_API ?? 'https://hub.dev.getstanza.dev',
  environment: 'local',
  stanzaApiKey: 'valid-api-key',
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
