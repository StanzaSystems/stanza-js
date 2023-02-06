import { assert, describe, expect, it } from 'vitest'
import * as Stanza from '../src/index'
import type { StanzaConfig } from '../src/index'

describe('saveState', () => {
  it('configures a stanza instance', () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      PageConfigs: [
        {
          Name: 'main',
          Features: ['featured', 'search', 'checkout']
        },
        {
          Name: 'details',
          Features: ['productSummary', 'pricing', 'shipping', 'checkout']
        }
      ]
    }

    expect(() => { Stanza.init(config) }).to.not.throw()
  })

  it('saves a stanza state', () => {
    const state: Stanza.StanzaState = {
      Page: 'main',
      Features: []
    }
    expect(() => { Stanza.savePageState(state) }).to.not.throw()
    assert.deepEqual(Stanza.getPageState(state.Page), state, 'returned state is saved state')
  })

  it('errors when page is not found', () => {
    expect(() => { Stanza.getPageState('fake') }).to.throw()
  })

  it('fetches correct feature list', async () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      PageConfigs: [
        {
          Name: 'main',
          Features: ['featured', 'search', 'checkout']
        },
        {
          Name: 'details',
          Features: ['productSummary', 'pricing', 'shipping', 'checkout']
        }
      ]
    }
    const state = await Stanza.getRefreshStateForPageFeatures('details', config)

    assert.equal(state.Page, 'details')

    // based on msw handler.ts, the features back should be 'productSummary', 'shipping'
    // if handler.ts is changed, this test will fail
    assert.equal(state.Features.length, 2, 'two features are returned')
    assert.exists(state.Features.find(e => { return e.Name === 'productSummary' }), 'productSummary is found')
    assert.exists(state.Features.find(e => { return e.Name === 'shipping' }), 'shipping is found')
  })
})
