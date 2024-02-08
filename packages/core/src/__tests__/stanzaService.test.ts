import { describe, expect, it } from 'vitest';
import { Stanza } from '../index';
import { type StanzaCoreConfig } from '../models/stanzaCoreConfig';

describe('saveState', async () => {
  it('configures a stanza instance', async () => {
    const config: StanzaCoreConfig = {
      url: 'https://hub.dev.getstanza.dev',
      environment: 'local',
      stanzaApiKey: '12345667',
      contextConfigs: [
        {
          name: 'main',
          features: ['featured', 'search', 'checkout'],
        },
        {
          name: 'details',
          features: ['productSummary', 'pricing', 'shipping', 'checkout'],
        },
      ],
    };

    await expect(Stanza.init(config)).resolves.not.toThrow();
  });
});
