import * as oTelApi from '@opentelemetry/api'
import { type Context } from '@opentelemetry/api'
import { type Fn } from '../utils/fn'

type ContextMapFunction = (context: Context) => Context
export const bindContext = <TArgs extends any[], TReturn>(
  mapFns: ContextMapFunction[],
  fn: Fn<TArgs, TReturn>
): Fn<TArgs, TReturn> => {
  return mapFns.length > 0
    ? oTelApi.context.bind(
        mapFns.reduce(
          (context, mapFn) => mapFn(context),
          oTelApi.context.active()
        ),
        fn
      )
    : fn
}
