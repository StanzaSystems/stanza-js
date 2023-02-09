import type { StanzaConfig } from 'stanza-core'

const config: StanzaConfig = {
  Environment: 'local',
  StanzaCustomerId: '215a500a-96f9-11ed-99db-00155dd65014',
  Url: 'http://localhost:3004',
  FeatureGroups: [
    {
      Name: 'main',
      Features: ['featured', 'search', 'checkout']
    },
    {
      Name: 'details',
      Features: ['productSummary', 'pricing', 'shipping', 'checkout']
    }
  ]
}

export { config }
