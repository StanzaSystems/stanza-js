import { type StanzaCoreConfig } from '@getstanza/core';
import StanzaBrowser from './index';

describe('refresh contexts', () => {
  it('finds all used contexts', async () => {
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

    await expect(StanzaBrowser.init(config)).resolves.not.toThrow();

    await expect(StanzaBrowser.getContextHot('main')).resolves.not.toThrow();

    await expect(StanzaBrowser.getContextHot('details')).resolves.not.toThrow();

    const mainContext = await StanzaBrowser.getContextStale('main');
    expect(mainContext?.name).toEqual('main');

    const detailContext = await StanzaBrowser.getContextStale('details');
    expect(detailContext?.name).toEqual('details');
  });
});
