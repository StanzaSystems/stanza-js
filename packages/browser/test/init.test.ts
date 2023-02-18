import { describe, expect, it } from 'vitest'
import Stanza, { type StanzaConfig } from '../src/index'

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
})
