import { propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { deletePriorityBoostFromContextBaggage } from './deletePriorityBoostFromContextBaggage';

describe('deletePriorityBoostFromContextBaggage', () => {
  it('should remove priority boost from baggage', function () {
    const context = propagation.setBaggage(
      ROOT_CONTEXT,
      propagation.createBaggage({
        'stz-boost': { value: '1' },
        'uberctx-stz-boost': { value: '1' },
        'ot-baggage-stz-boost': { value: '1' },
        foo: { value: 'bar' },
      }),
    );

    expect(deletePriorityBoostFromContextBaggage(context)).toHaveBaggage({
      foo: { value: 'bar' },
    });
  });
});
