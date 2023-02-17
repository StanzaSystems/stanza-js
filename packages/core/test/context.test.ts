import { assert, describe, expect, it } from 'vitest'
import { Stanza, utils } from '../src/index'
import { createContext } from '../src/models/Context'
import type { StanzaConfig, Context } from '../src/index'
import { type Feature, ActionCode } from '../src/models/Feature'

describe('saveState', () => {
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

  it('saves a stanza context if changed', () => {
    let context: Context = createContext('asdf', [], 1)
    /// attempts to save context from an unconfigured name should throw
    expect(() => { utils.saveContextIfChanged(context) }).to.throw()

    context = createContext('main', [], 1) // this name is configured
    let result
    // configured name should not throw
    expect(() => { result = utils.saveContextIfChanged(context) }).to.not.throw()
    assert.equal(result, true, 'save context returns true because this is the first time this name has been saved')
    assert.deepEqual(Stanza.getContextStale(context.name), context, 'returned context is saved context')
    result = utils.saveContextIfChanged(context)
    assert.equal(result, false, 'save context returns false because save has been called with an unchanged name')

    const feature: Feature = { name: 'coolFeature', code: ActionCode.REMOVE }

    context = createContext('main', [feature], 1)
    console.log(context)
    result = utils.saveContextIfChanged(context)
    assert.equal(result, true, 'save context returns true because a feature has been added to the saved context')
  })

  it('errors when name is not found', () => {
    expect(() => { Stanza.getContextStale('fake') }).to.throw()
  })
})
