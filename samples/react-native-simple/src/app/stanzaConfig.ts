import { STANZA_API_KEY, STANZA_ENVIRONMENT, STANZA_HUB_ADDRESS } from '@env';
import type { StanzaCoreConfig } from '@getstanza/core';

const stanzaKey = STANZA_API_KEY;

if (typeof stanzaKey !== 'string') {
  const s =
    'The VITE_STANZA_BROWSER_KEY environment variable has not been set. It must be set to a valid key at build time for this sample application to work correctly.';
  console.error('- \x1b[31;1merror\x1b[0m ' + s); // Ansi code for red+bold to fit with NX log styling. (Alternatively, could use chalk library.)
}

const config: StanzaCoreConfig = {
  url: STANZA_HUB_ADDRESS ?? 'https://hub.stanzasys.co',
  environment: STANZA_ENVIRONMENT ?? 'local',
  stanzaApiKey: stanzaKey ?? '',
  contextConfigs: [
    {
      name: 'main',
      features: ['featured', 'search', 'checkout'],
    },
    {
      name: 'details',
      features: ['productSummary', 'shipping', 'checkout'],
    },
  ],
  refreshSeconds: 3,
  isReactNative: true,
};

export { config };
