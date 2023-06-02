import type { StanzaCoreConfig } from '@getstanza/core'

const config: StanzaCoreConfig = {
  url: process.env.STANZA_HUB_ADDRESS ?? 'http://localhost:9010',
  environment: 'local',
  stanzaApiKey: 'valid-api-key',
  contextConfigs: [
    {
      name: 'main',
      features: ['featured', 'search', 'checkout']
    },
    {
      name: 'details',
      features: ['productSummary', 'shipping', 'checkout']
    }
  ],
  refreshSeconds: 3
}

export { config }
