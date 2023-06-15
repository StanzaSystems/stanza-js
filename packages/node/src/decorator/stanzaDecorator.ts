import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaDecoratorToContext } from '../context/addStanzaDecoratorToContext'
import { addStanzaTokenToContext } from '../context/addStanzaTokenToContext'
import { bindContext } from '../context/bindContext'
import { removeStanzaTokenFromContext } from '../context/removeStanzaTokenFromContext'
import { createStanzaWrapper } from '../utils/createStanzaWrapper'
import { type Fn } from '../utils/fn'
import { isTruthy } from '../utils/isTruthy'
import { type Promisify } from '../utils/promisify'
import { initOrGetDecorator } from './initOrGetDecorator'
import { type StanzaDecoratorOptions } from './model'
import { eventBus, events } from '../global/eventBus'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { hubService } from '../global/hubService'

export const stanzaDecorator = <TArgs extends any[], TReturn>(options: StanzaDecoratorOptions) => {
  const { guard } = createStanzaDecorator(options)

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    const resultFn = async function (...args: Parameters<typeof fn>) {
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

      return (fnWithBoundContext(...args) as Promisify<TReturn>)
    }

    return wrapEventsAsync(resultFn, {
      success: () => {
        void eventBus.emit(events.request.succeeded, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator
        })
      },
      failure: () => {
        void eventBus.emit(events.request.failed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator
        })
      },
      latency: (...[latency]) => {
        void eventBus.emit(events.request.latency, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          latency
        })
      }
    }) as Fn<TArgs, Promisify<TReturn>>
  })
}

const createStanzaDecorator = (options: StanzaDecoratorOptions) => {
  const initializedDecorator = initOrGetDecorator(options)
  return {
    ...initializedDecorator,
    guard: wrapEventsAsync(initializedDecorator.guard, {
      success: () => {
        void eventBus.emit(events.request.allowed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator
        })
      },
      failure: () => {
        void eventBus.emit(events.request.blocked, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          reason: 'quota'
        })
      }
    })
  }
}
