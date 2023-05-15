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
import { events, messageBus } from '../global/messageBus'

export const stanzaDecorator = <TArgs extends any[], TReturn>(options: StanzaDecoratorOptions) => {
  const { guard } = initDecorator(options)

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    return (async function (...args: Parameters<typeof fn>) {
      const decoratorExecutionStart = performance.now()
      const token = await guard().catch(err => {
        void messageBus.emit(events.request.blocked, {
          decorator: options.decorator,
          reason: 'quota'
        })
        throw err
      })
      void messageBus.emit(events.request.allowed, {
        decorator: options.decorator
      })

      const fnWithBoundContext = bindContext([
        addStanzaDecoratorToContext(options.decorator),
        options.priorityBoost !== undefined ? addPriorityBoostToContext(options.priorityBoost) : undefined,
        token?.type === 'TOKEN_GRANTED'
          ? addStanzaTokenToContext(token.token)
          : token?.type === 'TOKEN_VALIDATED'
            ? removeStanzaTokenFromContext()
            : null
      ].filter(isTruthy), fn)

      try {
        const result = await (fnWithBoundContext(...args) as Promisify<TReturn>)
        void messageBus.emit(events.request.succeeded, {
          decorator: options.decorator
        })
        const decoratorExecutionEnd = performance.now()
        void messageBus.emit(events.request.latency, {
          decorator: options.decorator,
          latency: decoratorExecutionEnd - decoratorExecutionStart
        })
        return result
      } catch (err) {
        void messageBus.emit(events.request.failed, {
          decorator: options.decorator
        })
        throw err
      }
    }) as Fn<TArgs, Promisify<TReturn>>
  })
}
