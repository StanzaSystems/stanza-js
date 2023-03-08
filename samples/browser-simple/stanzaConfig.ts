import type { StanzaCoreConfig } from '@getstanza/core'

const config: StanzaCoreConfig = {
  url: 'https://hub.dev.getstanza.dev',
  environment: 'local',
  stanzaApiKey: 'valid-api-key',
  contextConfigs: [
    {
      name: 'main',
      features: ['featured', 'search', 'checkout']
    },
    {
      name: 'details',
      features: ['productSummary', 'pricing', 'shipping', 'checkout']
    }
  ],
  refreshSeconds: 3
}

export { config }
