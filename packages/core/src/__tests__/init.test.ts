import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type StanzaCoreConfig } from '../models/stanzaCoreConfig';

let { Stanza } = await import('../index');

describe('init stanza', () => {
  beforeEach(async () => {
    vi.resetModules();
    Stanza = (await import('../index')).Stanza;
  });

  it('validates URL', async () => {
    const config: StanzaCoreConfig = {
      url: 'asdfasdf',
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

    await expect(Stanza.init(config)).rejects.toThrow('is not a valid url');
  });

  it('configures a stanza instance', async () => {
    const config: StanzaCoreConfig = {
      url: 'https://url.to.hub',
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

  it('configures only one stanza', async () => {
    const config: StanzaCoreConfig = {
      url: 'https://url.to.hub',
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
    await expect(Stanza.init(config)).rejects.toThrow();
  });
});
