import { type Fn } from '../utils/fn';
import { type ContextMapFunction, pipeContext } from './pipeContext';
import { context } from '@opentelemetry/api';

export const bindContext = <TArgs extends any[], TReturn>(
  mapFns: ContextMapFunction[],
  fn: Fn<TArgs, TReturn>
): Fn<TArgs, TReturn> => context.bind(pipeContext(mapFns), fn);
