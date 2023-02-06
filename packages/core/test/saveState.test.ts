import { assert, describe, expect, it } from 'vitest'
import * as Stanza from '../src/index'
import type { StanzaConfig } from '../src/index'

describe('saveState', () => {
  it('configures a stanza instance', () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      PageFeatures: new Map<string, string[]>(Object.entries({
        main: ['featured', 'search', 'checkout'],
        details: ['productSummary', 'pricing', 'shipping', 'checkout']
      }))
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
})
