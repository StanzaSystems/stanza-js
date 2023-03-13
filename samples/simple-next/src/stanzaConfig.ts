import type { StanzaCoreConfig } from '@getstanza/core'

const config: StanzaCoreConfig = {
  url: 'http://localhost:3000/api/hub',
  environment: 'local',
  stanzaApiKey: 'valid-api-key',
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
    if (process.browser) {
      return fetch('/api/enablementNumber').then(async res => res.json()).then(enablementNumber => {
        return enablementNumber
      })
    }
    return 100
  }

}

export { config }
