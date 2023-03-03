import { type StanzaCoreConfig } from 'stanza-core'
import { describe, expect, it } from 'vitest'
import { StanzaBrowser } from '../index'

describe('refresh contexts', () => {
  it('finds all used contexts', async () => {
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

    expect(() => { StanzaBrowser.init(config) }).not.toThrow()

    await StanzaBrowser.getContextHot('main')
    await StanzaBrowser.getContextHot('details')

    const mainContext = StanzaBrowser.getContextStale('main')
    expect(mainContext?.name).toEqual('main')

    const detailContext = StanzaBrowser.getContextStale('details')
    expect(detailContext?.name).toEqual('details')
  })
})
