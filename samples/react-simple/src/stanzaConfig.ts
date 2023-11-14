import type { StanzaCoreConfig } from '@getstanza/browser'

const stanzaKey = import.meta.env.VITE_STANZA_BROWSER_KEY

if (typeof stanzaKey !== 'string') {
  const s = 'The VITE_STANZA_BROWSER_KEY environment variable has not been set. It must be set to a valid key at build time for this sample application to work correctly.'
  console.error('- \x1b[31;1merror\x1b[0m ' + s) // Ansi code for red+bold to fit with NX log styling. (Alternatively, could use chalk library.)
}

const config: StanzaCoreConfig = {
  url: import.meta.env.VITE_STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co',
  environment: import.meta.env.VITE_STANZA_ENVIRONMENT ?? 'local',
  stanzaApiKey: stanzaKey ?? '',
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
