import { addPriorityBoostToContext } from './context/priorityBoost';
import { bindContext } from './context/bindContext';
import { createStanzaWrapper } from './utils/createStanzaWrapper';

export const stanzaPriorityBoost = <TArgs extends any[], TReturn>(
  priorityBoost: number,
) => {
  return createStanzaWrapper<TArgs, TReturn>((fn) => {
    return bindContext([addPriorityBoostToContext(priorityBoost)], fn);
  });
};
