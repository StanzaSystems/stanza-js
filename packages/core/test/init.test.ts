import { assert, describe, expect, it } from 'vitest'
import * as Stanza from '../src/index'
import type { StanzaConfig } from '../src/index'

describe('init stanza', () => {
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
    assert.deepEqual(Stanza.stanzaConfig, config, 'config is unchanged on init')
  })

  it('configures only one stanza', () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      PageFeatures: new Map<string, string[]>(Object.entries({
        main: ['featured', 'search', 'checkout'],
        details: ['productSummary', 'pricing', 'shipping', 'checkout']
      }))
    }
    expect(() => { Stanza.init(config) }).to.throw()
  })
})
