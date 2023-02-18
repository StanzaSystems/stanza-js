import { utils } from 'stanza-core'
import { describe, expect, it, assert } from 'vitest'
import Stanza, { type StanzaConfig } from '../src/index'

describe('refresh contexts', () => {
  it('finds all used contexts', async () => {
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

    await Stanza.getContextHot('main')
    await Stanza.getContextHot('details')

    const mainContext = utils.globals.getStateProvider().getContext('main')
    expect(() => { localStorage.getItem('stanza_main') }).to.not.throw()
    assert.equal(mainContext?.name, 'main')

    const contexts = utils.globals.getStateProvider().getAllContexts()

    assert.equal(contexts.length, 2)
  })
})
