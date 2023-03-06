import type { StanzaCoreConfig } from '@getstanza/core'

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
  refreshSeconds: 3,
  enablementNumberGenerator: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return 50
  }
}

export { config }
