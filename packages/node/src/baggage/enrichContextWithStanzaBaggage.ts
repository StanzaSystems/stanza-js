import { type Context, propagation } from '@opentelemetry/api';
import { getAllStanzaBaggageEntries } from './getAllStanzaBaggageEntries';
import { getStanzaBaggageKeys } from './getStanzaBaggageKeys';

export const enrichContextWithStanzaBaggage = (context: Context): Context => {
  const baggage = propagation.getBaggage(context);

  if (baggage === undefined) {
    return context;
  }

  const stanzaEntries = getAllStanzaBaggageEntries(baggage);

  const newBaggage = stanzaEntries
    .map(({ key: stanzaKey, entry }) =>
      getStanzaBaggageKeys(stanzaKey).map((key) => ({ key, entry })),
    )
    .flat()
    .reduce(
      (currentBaggage, { key, entry }) => currentBaggage.setEntry(key, entry),
      baggage,
    );

  return propagation.setBaggage(context, newBaggage);
};
