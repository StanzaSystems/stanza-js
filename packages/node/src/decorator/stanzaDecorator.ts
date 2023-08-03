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
import { getServiceConfig } from '../global/serviceConfig'

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
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.request.succeeded, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.request.failed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          customerId
        })
      },
      latency: async (...[latency]) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.request.latency, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          customerId,
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
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.request.allowed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.request.blocked, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          decoratorName: options.decorator,
          customerId,
          reason: 'quota'
        })
      }
    })
  }
}
