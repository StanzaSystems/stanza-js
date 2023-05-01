import { type Fn } from './fn'

export const createStanzaWrapper = <TArgs extends any[], TReturn, TBoundReturn = TReturn>(bind: (fn: Fn<TArgs, TReturn>) => Fn<TArgs, TBoundReturn>) => {
  return {
    bind,
    call,
    apply
  }

  function call (fn: Fn<TArgs, TReturn>,
    thisArg?: ThisParameterType<Fn<TArgs, TReturn>>,
    ...args: TArgs): TBoundReturn {
    return bind(fn).apply(thisArg, args)
  }

  function apply (fn: Fn<TArgs, TReturn>,
    thisArg?: ThisParameterType<Fn<TArgs, TReturn>>,
    args?: TArgs): TBoundReturn {
    return (args !== undefined ? bind(fn).apply(thisArg, args) : bind(fn).apply(thisArg))
  }
}
