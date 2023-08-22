import { addPriorityBoostToContext } from '../context/addPriorityBoostToContext'
import { addStanzaGuardToContext } from '../context/addStanzaGuardToContext'
import { addStanzaTokenToContext } from '../context/addStanzaTokenToContext'
import { bindContext } from '../context/bindContext'
import { removeStanzaTokenFromContext } from '../context/removeStanzaTokenFromContext'
import { createStanzaWrapper } from '../utils/createStanzaWrapper'
import { type Fn } from '../utils/fn'
import { isTruthy } from '../utils/isTruthy'
import { type Promisify } from '../utils/promisify'
import { initOrGetGuard } from './initOrGetGuard'
import { type StanzaGuardOptions } from './model'
import { eventBus, events } from '../global/eventBus'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { hubService } from '../global/hubService'
import { getServiceConfig } from '../global/serviceConfig'

export const stanzaGuard = <TArgs extends any[], TReturn>(options: StanzaGuardOptions) => {
  const { guard } = createStanzaGuard(options)

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    const resultFn = async function (...args: Parameters<typeof fn>) {
      const token = await guard()

      const fnWithBoundContext = bindContext([
        addStanzaGuardToContext(options.guard),
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
        return eventBus.emit(events.guard.succeeded, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          guardName: options.guard,
          customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.guard.failed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          guardName: options.guard,
          customerId
        })
      },
      duration: async (...[duration]) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.guard.duration, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          guardName: options.guard,
          customerId,
          duration
        })
      }
    }) as Fn<TArgs, Promisify<TReturn>>
  })
}

const createStanzaGuard = (options: StanzaGuardOptions) => {
  const initializedGuard = initOrGetGuard(options)
  return {
    ...initializedGuard,
    guard: wrapEventsAsync(initializedGuard.guard, {
      success: async (result) => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.guard.allowed, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          guardName: options.guard,
          customerId,
          reason: result !== null ? 'quota' : 'fail_open'
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        return eventBus.emit(events.guard.blocked, {
          ...hubService.getServiceMetadata(),
          featureName: options.feature ?? '',
          guardName: options.guard,
          customerId,
          reason: 'quota'
        })
      }
    })
  }
}
