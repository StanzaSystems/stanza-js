import { assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { type StanzaCoreConfig } from '../index';

let { Stanza, utils } = await import('../index');

describe('features', () => {
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

  beforeEach(async () => {
    vi.resetModules();
    const indexModule = await import('../index');
    Stanza = indexModule.Stanza;
    utils = indexModule.utils;

    Stanza.init(config);
  });

  it('gets a hot features', async () => {
    const features = ['featured', 'search', 'checkout'].sort((a, b) =>
      a.localeCompare(b)
    );
    const hotFeatureStates = (await Stanza.getFeatureStatesHot(features)).sort(
      (a, b) => a.featureName.localeCompare(b.featureName)
    );
    const cachedFeatures = features
      .map((feature) =>
        utils.globals.getStateProvider().getFeatureState(feature)
      )
      .filter(Boolean);

    assert.deepEqual(
      cachedFeatures,
      hotFeatureStates,
      'cached context equals result of get context hot'
    );
  });

  it('returns an enabled feature when features not found', async () => {
    const featureStatesStale = await Stanza.getFeatureStatesStale(['fake']);
    expect(featureStatesStale).toEqual([
      {
        featureName: 'fake',
        enabledPercent: 100,
        lastRefreshTime: 0,
      },
    ]);
  });

  it('fetches correct feature list', async () => {
    const browserFeatures = await Stanza.getFeatureStatesHot([
      'productSummary',
      'pricing',
      'shipping',
      'checkout',
    ]);

    // based on msw handler.ts, the features back should be 'productSummary', 'shipping'
    // if handler.ts is changed, this test will fail
    expect(browserFeatures).toHaveLength(4);
    expect(browserFeatures).toContainEqual({
      featureName: 'pricing',
      enabledPercent: 100,
      lastRefreshTime: expect.anything(),
    });
    expect(browserFeatures).toContainEqual({
      featureName: 'checkout',
      enabledPercent: 100,
      lastRefreshTime: expect.anything(),
    });
    expect(browserFeatures).toContainEqual(
      expect.objectContaining({
        featureName: 'productSummary',
        enabledPercent: 100,
        lastRefreshTime: expect.anything(),
      })
    );
    expect(browserFeatures).toContainEqual(
      expect.objectContaining({
        featureName: 'shipping',
        enabledPercent: 0,
        lastRefreshTime: expect.anything(),
      })
    );
  });
});
