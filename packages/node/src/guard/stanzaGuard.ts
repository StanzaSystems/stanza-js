import { addPriorityBoostToContext } from '../context/priorityBoost'
import { addStanzaGuardToContext } from '../context/guard'
import { addStanzaTokenToContext } from '../context/addStanzaTokenToContext'
import { bindContext } from '../context/bindContext'
import { removeStanzaTokenFromContext } from '../context/removeStanzaTokenFromContext'
import { createStanzaWrapper } from '../utils/createStanzaWrapper'
import { type Fn } from '../utils/fn'
import { isTruthy } from '../utils/isTruthy'
import { type Promisify } from '../utils/promisify'
import { initOrGetGuard } from './initOrGetGuard'
import { type StanzaGuardOptions } from './model'
import { eventBus, events, type ReasonData } from '../global/eventBus'
import { wrapEventsAsync } from '../utils/wrapEventsAsync'
import { hubService } from '../global/hubService'
import { getServiceConfig } from '../global/serviceConfig'
import { getActiveStanzaEntry } from '../baggage/getActiveStanzaEntry'
import { getGuardConfig } from '../global/guardConfig'
import { StanzaGuardError } from './stanzaGuardError'
import { identity } from 'ramda'

export const stanzaGuard = <TArgs extends any[], TReturn>(
  options: StanzaGuardOptions
) => {
  const { guard } = createStanzaGuard(options)

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    const resultFn = async function (...args: Parameters<typeof fn>) {
      const outerFn = bindContext(
        [
          addStanzaGuardToContext(options.guard),
          options.priorityBoost !== undefined &&
            addPriorityBoostToContext(options.priorityBoost)
        ].filter(isTruthy),
        async () => {
          const guardResult = await guard()

          const failure = guardResult.find(r => r.status === 'failure')
          if (failure !== undefined) {
            throw failure.type === 'QUOTA'
              ? new StanzaGuardError('NoQuota', 'Guard can not be executed')
              : new StanzaGuardError('InvalidToken', 'Provided token was invalid')
          }

          const fnWithBoundContext = bindContext(
            guardResult
              .filter(isTruthy)
              .map((token) =>
                token?.type === 'QUOTA' && token.status === 'success'
                  ? addStanzaTokenToContext(token.token)
                  : token.type === 'TOKEN_VALIDATE' && token.status === 'success'
                    ? removeStanzaTokenFromContext()
                    : identity
              ),
            fn
          )

          return fnWithBoundContext(...args) as Promisify<TReturn>
        }
      )
      return outerFn()
    }

    return wrapEventsAsync(resultFn, {
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId
        const { serviceName, environment, clientId } = hubService.getServiceMetadata()
        return eventBus.emit(events.guard.succeeded, {
          serviceName,
          environment,
          clientId,
          featureName: getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId
        })
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId
        const { serviceName, environment, clientId } = hubService.getServiceMetadata()
        return eventBus.emit(events.guard.failed, {
          serviceName,
          environment,
          clientId,
          featureName: getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId
        })
      },
      duration: async (...[duration]) => {
        const customerId = getServiceConfig()?.config.customerId
        const { serviceName, environment, clientId } = hubService.getServiceMetadata()
        return eventBus.emit(events.guard.duration, {
          serviceName,
          environment,
          clientId,
          featureName: getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
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
        const { serviceName, environment, clientId } = hubService.getServiceMetadata()
        return eventBus.emit(events.guard.allowed, {
          serviceName,
          environment,
          clientId,
          featureName: getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId,
          ...getReasons(result.filter(isTruthy).map(({ reason }) => reason)),
          mode: 'normal'
          // reason: result.some((reason) => reason !== null) ? 'quota' : 'fail_open'
        })
      },
      failure: async (err) => {
        if (err instanceof StanzaGuardError) {
          const customerId = getServiceConfig()?.config.customerId
          const { serviceName, environment, clientId } = hubService.getServiceMetadata()
          return eventBus.emit(events.guard.blocked, {
            serviceName,
            environment,
            clientId,
            featureName: getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
            guardName: options.guard,
            customerId,
            ...getReasons([err]),
            mode: 'normal'
          })
        }
      }
    })
  }

  function getReasons (reasons: Array<Partial<ReasonData> | StanzaGuardError>): ReasonData {
    return reasons.reduce<ReasonData>((resultReasons, current) => {
      return current instanceof StanzaGuardError ? resultReasons : Object.assign(resultReasons, current)
    }, {
      configState: getGuardConfig(options.guard) !== undefined ? 'CONFIG_CACHED_OK' : 'CONFIG_UNSPECIFIED', // TODO
      localReason: 'LOCAL_NOT_SUPPORTED',
      tokenReason: 'TOKEN_UNSPECIFIED',
      quotaReason: 'QUOTA_UNSPECIFIED'
    })

    // return {
    //   configState: getGuardConfig(options.guard) !== undefined ? 'CONFIG_CACHED_OK' : 'CONFIG_UNSPECIFIED', // TODO
    //   localReason: 'LOCAL_NOT_SUPPORTED',
    //   // tokenReason: reasons.map<ReasonData['tokenReason']>(r => {
    //   //   if (r === null) {
    //   //     return 'TOKEN_UNSPECIFIED'
    //   //   }
    //   //   if (r instanceof StanzaGuardError) {
    //   //     return r.reason === 'InvalidToken' ? 'TOKEN_NOT_VALID' : 'TOKEN_UNSPECIFIED'
    //   //   }
    //   //   if (r.type === 'TOKEN_VALIDATED') {
    //   //     return 'TOKEN_VALID'
    //   //   }
    //   //   return 'TOKEN_UNSPECIFIED'
    //   // })[0], // TODO
    //   // quotaReason: reasons.map<ReasonData['quotaReason']>(r => {
    //   //   if (r === null) {
    //   //     return 'QUOTA_UNSPECIFIED'
    //   //   }
    //   //   if (r instanceof StanzaGuardError) {
    //   //     return r.reason === 'NoQuota' ? 'QUOTA_BLOCKED' : 'QUOTA_UNSPECIFIED'
    //   //   }
    //   //   if (r.type === 'QUOTA_GRANTED') {
    //   //     return 'QUOTA_GRANTED'
    //   //   }
    //   //   return 'QUOTA_UNSPECIFIED'
    //   // })[0] // TODO
    // }
  }
}
