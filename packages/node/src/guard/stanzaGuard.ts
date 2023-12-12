import { addPriorityBoostToContext } from '../context/priorityBoost';
import { addStanzaGuardToContext } from '../context/guard';
import { addStanzaTokenToContext } from '../context/addStanzaTokenToContext';
import { bindContext } from '../context/bindContext';
import { removeStanzaTokenFromContext } from '../context/removeStanzaTokenFromContext';
import { createStanzaWrapper } from '../utils/createStanzaWrapper';
import { type Fn } from '../utils/fn';
import { isTruthy } from '../utils/isTruthy';
import { type Promisify } from '../utils/promisify';
import { initOrGetGuard } from './initOrGetGuard';
import { type StanzaGuardOptions } from './model';
import { eventBus, events, type ReasonData } from '../global/eventBus';
import { wrapEventsAsync } from '../utils/wrapEventsAsync';
import { hubService } from '../global/hubService';
import { getServiceConfig } from '../global/serviceConfig';
import { getActiveStanzaEntry } from '../baggage/getActiveStanzaEntry';
import { getGuardConfig } from '../global/guardConfig';
import { StanzaGuardError } from './stanzaGuardError';
import { identity } from 'ramda';
import { type Scheduler } from '../utils/scheduler';

export const stanzaGuard = <TArgs extends any[], TReturn>(
  options: StanzaGuardOptions,
  scheduler: Scheduler
) => {
  const { guard } = createStanzaGuard(options, scheduler);

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    const resultFn = async function (...args: Parameters<typeof fn>) {
      const outerFn = bindContext(
        [
          addStanzaGuardToContext(options.guard),
          options.priorityBoost !== undefined &&
            addPriorityBoostToContext(options.priorityBoost),
        ].filter(isTruthy),
        async () => {
          const guardResult = await guard();

          const failure = guardResult.find(
            (r): r is typeof r & { status: 'failure' } => r.status === 'failure'
          );
          if (
            failure !== undefined &&
            getGuardConfig(options.guard)?.config.reportOnly !== true
          ) {
            throw failure.type === 'QUOTA'
              ? new StanzaGuardError('NoQuota', failure.message)
              : new StanzaGuardError('InvalidToken', failure.message);
          }

          const fnWithBoundContext = bindContext(
            guardResult
              .filter(isTruthy)
              .map((token) =>
                token?.type === 'QUOTA' && token.status === 'success'
                  ? addStanzaTokenToContext(token.token)
                  : token.type === 'TOKEN_VALIDATE' &&
                    token.status === 'success'
                  ? removeStanzaTokenFromContext()
                  : identity
              ),
            fn
          );

          return fnWithBoundContext(...args) as Promisify<TReturn>;
        }
      );
      return outerFn();
    };

    return wrapEventsAsync(resultFn, {
      success: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.guard.succeeded, {
          serviceName,
          environment,
          clientId,
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId,
        });
      },
      failure: async () => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.guard.failed, {
          serviceName,
          environment,
          clientId,
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId,
        });
      },
      duration: async (...[duration]) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(events.guard.duration, {
          serviceName,
          environment,
          clientId,
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          customerId,
          duration,
        });
      },
    }) as Fn<TArgs, Promisify<TReturn>>;
  });
};

function getGuardMode(guardName: string) {
  const guardConfig = getGuardConfig(guardName)?.config;
  return guardConfig?.reportOnly === true
    ? 'report_only'
    : guardConfig?.reportOnly === false
    ? 'normal'
    : 'unspecified';
}

const createStanzaGuard = (
  options: StanzaGuardOptions,
  scheduler: Scheduler
) => {
  const initializedGuard = initOrGetGuard(options, scheduler);
  return {
    ...initializedGuard,
    guard: wrapEventsAsync(initializedGuard.guard, {
      success: async (result) => {
        const customerId = getServiceConfig()?.config.customerId;
        const { serviceName, environment, clientId } =
          hubService.getServiceMetadata();
        return eventBus.emit(
          result.some((r) => r.status === 'failure')
            ? events.guard.blocked
            : result.some((r) => r.status === 'failOpen')
            ? events.guard.failOpen
            : events.guard.allowed,
          {
            serviceName,
            environment,
            clientId,
            featureName:
              getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
            guardName: options.guard,
            customerId,
            ...getReasons(result.filter(isTruthy).map(({ reason }) => reason)),
            mode: getGuardMode(options.guard),
          }
        );
      },
      failure: async (err) => {
        if (err instanceof StanzaGuardError) {
          const customerId = getServiceConfig()?.config.customerId;
          const { serviceName, environment, clientId } =
            hubService.getServiceMetadata();
          return eventBus.emit(events.guard.blocked, {
            serviceName,
            environment,
            clientId,
            featureName:
              getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
            guardName: options.guard,
            customerId,
            ...getReasons([err]),
            mode: getGuardMode(options.guard),
          });
        }
      },
    }),
  };

  function getReasons(
    reasons: Array<Partial<ReasonData> | StanzaGuardError>
  ): ReasonData {
    return reasons.reduce<ReasonData>(
      (resultReasons, current) => {
        return current instanceof StanzaGuardError
          ? resultReasons
          : Object.assign(resultReasons, current);
      },
      {
        configState:
          getGuardConfig(options.guard) !== undefined
            ? 'CONFIG_CACHED_OK'
            : 'CONFIG_UNSPECIFIED', // TODO: distinguish unspecified and failed to fetch config
        localReason: 'LOCAL_NOT_SUPPORTED',
        tokenReason: 'TOKEN_UNSPECIFIED',
        quotaReason: 'QUOTA_UNSPECIFIED',
      }
    );
  }
};
