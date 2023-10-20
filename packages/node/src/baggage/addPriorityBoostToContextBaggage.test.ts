import { propagation, ROOT_CONTEXT } from '@opentelemetry/api'
import { describe, expect, it } from 'vitest'
import { stanzaPriorityBoostContextKey } from '../context/priorityBoost/stanzaPriorityBoostContextKey'
import { addPriorityBoostToContextBaggage } from './addPriorityBoostToContextBaggage'

describe('addPriorityBoostToContextBaggage', function () {
  it("should NOT set priority boost in baggage if it didn't exist already", function () {
    expect(addPriorityBoostToContextBaggage(ROOT_CONTEXT)).toHaveBaggage({})
  })

  it("should set priority boost in baggage if it didn't exist already", function () {
    const context = ROOT_CONTEXT.setValue(stanzaPriorityBoostContextKey, 1)

    expect(addPriorityBoostToContextBaggage(context)).toHaveBaggage({
      'stz-boost': { value: '1' },
      'uberctx-stz-boost': { value: '1' },
      'ot-baggage-stz-boost': { value: '1' }
    })
  })

  it('should set priority boost in baggage if invalid number existed already', function () {
    const context = propagation.setBaggage(ROOT_CONTEXT.setValue(stanzaPriorityBoostContextKey, 1), propagation.createBaggage({ 'stz-boost': { value: 'abc' } }))

    expect(addPriorityBoostToContextBaggage(context)).toHaveBaggage({
      'stz-boost': { value: '1' },
      'uberctx-stz-boost': { value: '1' },
      'ot-baggage-stz-boost': { value: '1' }
    })
  })

  it('should sum priority boosts in baggage if it did exist already', function () {
    const context = propagation.setBaggage(ROOT_CONTEXT.setValue(stanzaPriorityBoostContextKey, 1), propagation.createBaggage({ 'stz-boost': { value: '1' } }))

    expect(addPriorityBoostToContextBaggage(context)).toHaveBaggage({
      'stz-boost': { value: '2' },
      'uberctx-stz-boost': { value: '2' },
      'ot-baggage-stz-boost': { value: '2' }
    })
  })

  it('should remove priority boosts from baggage if it cancels out', function () {
    const context = propagation.setBaggage(ROOT_CONTEXT.setValue(stanzaPriorityBoostContextKey, -1), propagation.createBaggage({ 'stz-boost': { value: '1' } }))

    expect(addPriorityBoostToContextBaggage(context)).toHaveBaggage({})
  })
})
