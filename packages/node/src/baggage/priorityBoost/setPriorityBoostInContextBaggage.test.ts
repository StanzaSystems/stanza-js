import { setPriorityBoostInContextBaggage } from './setPriorityBoostInContextBaggage'
import { propagation, ROOT_CONTEXT } from '@opentelemetry/api'

describe('setPriorityBoostInContextBaggage', () => {
  it('should set priority boost in baggage', function () {
    expect(setPriorityBoostInContextBaggage(1)(ROOT_CONTEXT)).toHaveBaggage({
      'stz-boost': { value: '1' },
      'uberctx-stz-boost': { value: '1' },
      'ot-baggage-stz-boost': { value: '1' }
    })
  })

  it('should remove priority boost from baggage', function () {
    const context = propagation.setBaggage(ROOT_CONTEXT, propagation.createBaggage({
      'stz-boost': { value: '1' },
      'uberctx-stz-boost': { value: '1' },
      'ot-baggage-stz-boost': { value: '1' },
      foo: { value: 'bar' }
    }))

    expect(setPriorityBoostInContextBaggage(0)(context)).toHaveBaggage({
      foo: { value: 'bar' }
    })
  })
})
