import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaDecoratorToContext } from '../context/addStanzaDecoratorToContext'
import { addStanzaTokenToContext } from '../context/addStanzaTokenToContext'
import { bindContext } from '../context/bindContext'
import { removeStanzaTokenFromContext } from '../context/removeStanzaTokenFromContext'
import { createStanzaWrapper } from '../utils/createStanzaWrapper'
import { type Fn } from '../utils/fn'
import { isTruthy } from '../utils/isTruthy'
import { type Promisify } from '../utils/promisify'
import { initDecorator } from './initStanzaDecorator'
import { type StanzaDecoratorOptions } from './model'

export const stanzaDecorator = <TArgs extends any[], TReturn>(options: StanzaDecoratorOptions) => {
  const { guard } = initDecorator(options)

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    return (async function (...args: Parameters<typeof fn>) {
      const token = await guard()

      const fnWithBoundContext = bindContext([
        addStanzaDecoratorToContext(options.decorator),
        options.priorityBoost !== undefined ? addPriorityBoostToContext(options.priorityBoost) : undefined,
        token?.type === 'TOKEN_GRANTED'
          ? addStanzaTokenToContext(token.token)
          : token?.type === 'TOKEN_VALIDATED'
            ? removeStanzaTokenFromContext()
            : null
      ].filter(isTruthy), fn)

      return fnWithBoundContext(...args) as Promisify<TReturn>
    }) as Fn<TArgs, Promisify<TReturn>>
  })
}
