import { context, type Context } from '@opentelemetry/api';

export type ContextMapFunction = (context: Context) => Context;

export const pipeContext = (
  mapFns: Array<(context: Context) => Context>,
  ctx = context.active()
): Context => mapFns.reduce((context, mapFn) => mapFn(context), ctx);
