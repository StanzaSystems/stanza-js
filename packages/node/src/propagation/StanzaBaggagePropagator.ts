import {
  type Context,
  type TextMapGetter,
  type TextMapSetter,
} from '@opentelemetry/api';
import { W3CBaggagePropagator } from '@opentelemetry/core';
import {
  addPriorityBoostToContext,
  deletePriorityBoostFromContext,
  getPriorityBoostFromContext,
} from '../context/priorityBoost';
import { enrichContextWithStanzaBaggage } from '../baggage/enrichContextWithStanzaBaggage';
import {
  setPriorityBoostInContextBaggage,
  deletePriorityBoostFromContextBaggage,
  getPriorityBoostFromContextBaggage,
} from '../baggage/priorityBoost';
import { pipe } from 'ramda';

export class StanzaBaggagePropagator extends W3CBaggagePropagator {
  override inject(
    context: Context,
    carrier: unknown,
    setter: TextMapSetter,
  ): void {
    const currentPriorityBoost = getPriorityBoostFromContext(context);
    pipe(
      deletePriorityBoostFromContext,
      setPriorityBoostInContextBaggage(currentPriorityBoost),
      enrichContextWithStanzaBaggage,
      (ctx: Context) => {
        super.inject(ctx, carrier, setter);
      },
    )(context);
  }

  override extract(
    context: Context,
    carrier: unknown,
    getter: TextMapGetter,
  ): Context {
    return pipe(
      (ctx: Context): Context => super.extract(ctx, carrier, getter),
      enrichContextWithStanzaBaggage,
      (contextWithBaggage: Context) => {
        const priorityBoost =
          getPriorityBoostFromContextBaggage(contextWithBaggage);
        return addPriorityBoostToContext(priorityBoost)(contextWithBaggage);
      },
      deletePriorityBoostFromContextBaggage,
    )(context);
  }
}
