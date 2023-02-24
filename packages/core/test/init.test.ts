import { describe, expect, it } from 'vitest'
import type { StanzaCoreConfig } from '../src'
import { Stanza } from '../src'

describe('init stanza', () => {
  it('validates URL', () => {
    const config: StanzaCoreConfig = {
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

    expect(() => { Stanza.init(config) }).to.not.throw()
  })

  it('configures only one stanza', () => {
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
    expect(() => { Stanza.init(config) }).to.throw()
  })

  // it('fetches correct feature list', async () => {
  //   const browserFeatures = await utils.getContextBrowserFeatures('details')
  //
  //   // based on msw handler.ts, the features back should be 'productSummary', 'shipping'
  //   // if handler.ts is changed, this test will fail
  //   assert.equal(browserFeatures.length, 2, 'two features are returned')
  //   assert.exists(browserFeatures.find(e => { return e.featureName === 'productSummary' }), 'productSummary is found')
  //   assert.exists(browserFeatures.find(e => { return e.featureName === 'shipping' }), 'shipping is found')
  // })
})
