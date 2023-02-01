import { FeatureStatus } from 'stanza-core'
import type { StanzaConfig } from 'stanza-core'

const config: StanzaConfig = {
  Environment: 'local',
  LocalMode: true,
  StanzaCustomerId: '215a500a-96f9-11ed-99db-00155dd65014',
  Url: 'http://localhost:4242',
  TestFeatures: [
    {
      Name: 'graphui',
      Status: FeatureStatus.DEGRADED,
      ErrorMessage: 'We are having trouble loading the graph UI right now - please retry your request!!!!!!'
    },
    {
      Name: 'node_events',
      Status: FeatureStatus.FAIL_NO_SEND,
      ErrorMessage: 'Events for nodes are not available right now'
    },
    {
      Name: 'node_details',
      Status: FeatureStatus.FAIL_SEND,
      ErrorMessage: 'We are having trouble loading node definitions, refresh the page'
    },
    {
      Name: 'node_actions',
      Status: FeatureStatus.FAIL_REMOVE
    }
  ]
}

export { config }
