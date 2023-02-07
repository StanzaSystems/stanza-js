import { describe, expect, it } from 'vitest'
import * as Stanza from '../src/index'
import type { StanzaConfig } from '../src/index'

describe('init stanza', () => {
  it('validates URL', () => {
    const config: StanzaConfig = {
      Url: 'asdfasdf',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      FeatureGroups: [
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

    expect(() => { Stanza.init(config) }).to.throw()
  })
  it('configures a stanza instance', () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      FeatureGroups: [
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

  it('configures only one stanza', () => {
    const config: StanzaConfig = {
      Url: 'http://localhost:3004',
      Environment: 'local',
      StanzaCustomerId: '12345667',
      FeatureGroups: [
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
    expect(() => { Stanza.init(config) }).to.throw()
  })
})
