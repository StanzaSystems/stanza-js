import type { StanzaConfig } from 'stanza-core'

const config: StanzaConfig = {
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
  ]
}

export { config }
