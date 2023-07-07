import type { StanzaCoreConfig } from '@getstanza/core'

const stanzaKey = process.env.NEXT_PUBLIC_STANZA_BROWSER_KEY

if (typeof stanzaKey !== 'string') {
  const s = 'The NEXT_PUBLIC_STANZA_BROWSER_KEY environment variable has not been set. It must be set to a valid key at build time for this sample application to work correctly.'
  console.error('- \x1b[31;1merror\x1b[0m ' + s) // Ansi code for red+bold to fit with NX log styling. (Alternatively, could use chalk library.)
}

export const config: StanzaCoreConfig = {
  url: process.env.NEXT_PUBLIC_STANZA_HUB_ADDRESS ?? 'https://hub.demo.getstanza.io',
  environment: process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local',
  stanzaApiKey: stanzaKey ?? '',
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
