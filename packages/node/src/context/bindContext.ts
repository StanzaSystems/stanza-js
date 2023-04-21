import * as oTelApi from '@opentelemetry/api'
import { type Context } from '@opentelemetry/api'

type ContextMapFunction = (context: Context) => Context
export const bindContext = <Fn extends (...args: any[]) => unknown>(mapFns: ContextMapFunction[], fn: Fn): Fn => {
  return mapFns.length > 0
    ? oTelApi.context.bind(
      mapFns.reduce((context, mapFn) => mapFn(context), oTelApi.context.active()),
      fn
    )
    : fn
}
