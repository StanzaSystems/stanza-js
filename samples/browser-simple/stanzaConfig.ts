import type { StanzaCoreConfig } from 'stanza-core'

const config: StanzaCoreConfig = {
  url: 'http://localhost:3004',
  environment: 'local',
  stanzaCustomerId: '12345667',
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
