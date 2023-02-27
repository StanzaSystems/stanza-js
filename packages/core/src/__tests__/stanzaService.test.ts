import { describe, expect, it } from 'vitest'
import { Stanza } from '../index'
import { type StanzaCoreConfig } from '../models/StanzaCoreConfig'

describe('saveState', () => {
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

    expect(() => { Stanza.init(config) }).not.toThrow()
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
  //
  // it('converts BrowserFeature to Feature correctly', async () => {
  //   const browserFeatures = await utils.getContextBrowserFeatures('details')
  //   // convert browser feature to feature correctly based on enablementNumber
  //   const zeroFeatures = createContextFeaturesFromResponse(browserFeatures, 0)
  //
  //   // assert.equal(zeroFeatures.length, 2)
  //   const shippingFeature = zeroFeatures.find(f => { return f.name === 'shipping' })
  //   const productSummary = zeroFeatures.find(f => { return f.name === 'productSummary' })
  //   assert.isNotNull(shippingFeature)
  //   assert.isNotNull(productSummary)
  //   assert.deepEqual(shippingFeature, { name: 'shipping', code: 1, message: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process' })
  //   assert.deepEqual(productSummary, { name: 'productSummary', code: 0, message: 'We are having intermittent issues loading product summaries' })
  // })
})
