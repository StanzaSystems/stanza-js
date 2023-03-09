import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type StanzaCoreConfig } from '../models/StanzaCoreConfig'

let { Stanza } = await import('../index')

describe('init stanza', () => {
  beforeEach(async () => {
    vi.resetModules()
    Stanza = (await import('../index')).Stanza
  })

  it('validates URL', () => {
    const config: StanzaCoreConfig = {
      url: 'asdfasdf',
      environment: 'local',
      stanzaApiKey: '12345667',
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

    expect(() => { Stanza.init(config) }).toThrow('is not a valid url')
  })

  it('configures a stanza instance', () => {
    const config: StanzaCoreConfig = {
      url: 'https://hub.dev.getstanza.dev',
      environment: 'local',
      stanzaApiKey: '12345667',
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

    expect(() => {
      Stanza.init(config)
    }).not.toThrow()
  })

  it('configures only one stanza', () => {
    const config: StanzaCoreConfig = {
      url: 'https://hub.dev.getstanza.dev',
      environment: 'local',
      stanzaApiKey: '12345667',
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
    expect(() => { Stanza.init(config) }).toThrow()
  })
})
