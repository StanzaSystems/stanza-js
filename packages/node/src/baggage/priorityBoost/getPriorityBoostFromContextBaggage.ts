import { type Baggage, type Context, propagation } from '@opentelemetry/api';
import { getStanzaBaggageEntry } from '../getStanzaBaggageEntry';

const getStanzaPriorityBoost = (baggage: Baggage) => {
  const baggageMaybePriorityBoost = parseInt(
    getStanzaBaggageEntry('stz-boost', baggage)?.value ?? '',
  );

  return !isNaN(baggageMaybePriorityBoost) ? baggageMaybePriorityBoost : 0;
};

export const getPriorityBoostFromContextBaggage = (
  contextWithBaggage: Context,
) => {
  const baggage = propagation.getBaggage(contextWithBaggage);
  return baggage !== undefined ? getStanzaPriorityBoost(baggage) : 0;
};
