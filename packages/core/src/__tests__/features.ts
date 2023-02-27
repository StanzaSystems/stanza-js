import { assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { type StanzaCoreConfig } from '../index'
let { Stanza, utils } = await import('../index')

describe('features', () => {
  beforeEach(async () => {
    vi.resetModules()
    const indexModule = await import('../index')
    Stanza = indexModule.Stanza
    utils = indexModule.utils
  })

  it('gets a hot features', async () => {
    const features = ['featured', 'search', 'checkout']
    const hotFeatureStates = await Stanza.getFeatureStatesHot(features)
    const cachedFeatures = features.map(feature => utils.globals.getStateProvider().getFeatureState(feature)).filter(Boolean)

    assert.deepEqual(cachedFeatures, hotFeatureStates, 'cached context equals result of get context hot')
  })

  it('returns empty array when features not found', () => {
    expect(Stanza.getFeatureStatesStale(['fake'])).toEqual([])
  })

  it('fetches correct feature list', async () => {
    const config: StanzaCoreConfig = {
      url: 'http://localhost:3004',
      environment: 'local',
      stanzaCustomerId: '12345667',
      contextConfigs: [
        {
          name: 'main',
          features: ['featured', 'search', 'checkout']
        },
        {
          name: 'details',
          features: ['productSummary', 'pricing', 'shipping', 'checkout']
        }
      ]
    }
    Stanza.init(config)

    const browserFeatures = await Stanza.getFeatureStatesHot(['productSummary', 'pricing', 'shipping', 'checkout'])

    // based on msw handler.ts, the features back should be 'productSummary', 'shipping'
    // if handler.ts is changed, this test will fail
    assert.equal(browserFeatures.length, 2, 'two features are returned')
    assert.exists(browserFeatures.find(e => { return e.featureName === 'productSummary' }), 'productSummary is found')
    assert.exists(browserFeatures.find(e => { return e.featureName === 'shipping' }), 'shipping is found')
  })
})
