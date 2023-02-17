import { describe, expect, it, assert } from 'vitest'
import { Stanza, utils } from '../src/index'
import type { StanzaConfig } from '../src/index'

describe('init stanza', () => {
  it('validates URL', () => {
    const config: StanzaConfig = {
      url: 'asdfasdf',
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

    expect(() => { Stanza.init(config) }).to.throw()
  })
  it('configures a stanza instance', () => {
    const config: StanzaConfig = {
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

    expect(() => { Stanza.init(config) }).to.not.throw()
  })

  it('configures only one stanza', () => {
    const config: StanzaConfig = {
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
    expect(() => { Stanza.init(config) }).to.throw()
  })

  it('fetches correct feature list', async () => {
    const browserFeatures = await utils.getBrowserFeatures('details')

    // based on msw handler.ts, the features back should be 'productSummary', 'shipping'
    // if handler.ts is changed, this test will fail
    assert.equal(browserFeatures.length, 2, 'two features are returned')
    assert.exists(browserFeatures.find(e => { return e.featureName === 'productSummary' }), 'productSummary is found')
    assert.exists(browserFeatures.find(e => { return e.featureName === 'shipping' }), 'shipping is found')
  })
})
