import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaApiKeyToContext } from '../context/addStanzaApiKeyToContext'
import { addStanzaDecoratorToContext } from '../context/addStanzaDecoratorToContext'
import { bindContext } from '../context/bindContext'
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
        token !== null ? addStanzaApiKeyToContext(token) : undefined
      ].filter(isTruthy), fn)

      return fnWithBoundContext(...args) as Promisify<TReturn>
    }) as Fn<TArgs, Promisify<TReturn>>
  })
}
