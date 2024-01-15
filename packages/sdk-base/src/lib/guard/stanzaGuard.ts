import {
  addPriorityBoostToContext,
  getPriorityBoostFromContext,
} from '../context/priorityBoost';
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
import { context, SpanKind, trace } from '@opentelemetry/api';
import { getSdkMetadata } from '../global/sdkMetadata';

export const stanzaGuard = <TArgs extends any[], TReturn>(
  options: StanzaGuardOptions
) => {
  const { guard } = createStanzaGuard(options);

  return createStanzaWrapper<TArgs, TReturn, Promisify<TReturn>>((fn) => {
    const resultFn = async function (...args: Parameters<typeof fn>) {
      const outerFn = bindContext(
        [
          addStanzaGuardToContext(options.guard),
          options.priorityBoost !== undefined &&
            addPriorityBoostToContext(options.priorityBoost),
        ].filter(isTruthy),
        async () => {
          const { name, version } = getSdkMetadata();
          return trace.getTracer(name, version).startActiveSpan(
            'StanzaGuard',
            {
              kind: SpanKind.INTERNAL,
              attributes: {
                ...getDefaultContextData(),
                featureName:
                  getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
                guardName: options.guard,
                priorityBoost: getPriorityBoostFromContext(context.active()),
                mode: getGuardMode(options.guard),
              },
            },
            context.active(),
            async (span) => {
              try {
                const guardResult = await guard();

                const failure = guardResult.find(
                  (r): r is typeof r & { status: 'failure' } =>
                    r.status === 'failure'
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
                  guardResult.filter(isTruthy).map((token) => {
                    if (token.status === 'success') {
                      switch (token.type) {
                        case 'QUOTA':
                          return addStanzaTokenToContext(token.token);
                        case 'TOKEN_VALIDATE':
                          return removeStanzaTokenFromContext();
                      }
                    }
                    return identity;
                  }),
                  fn
                );

                return await (fnWithBoundContext(
                  ...args
                ) as Promisify<TReturn>);
              } finally {
                span.end();
              }
            }
          );
        }
      );
      return outerFn();
    };

    return wrapEventsAsync(resultFn, {
      success: async () => {
        return eventBus.emit(events.guard.succeeded, {
          ...getDefaultContextData(),
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
        });
      },
      failure: async () => {
        return eventBus.emit(events.guard.failed, {
          ...getDefaultContextData(),
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
        });
      },
      duration: async (...[duration]) => {
        return eventBus.emit(events.guard.duration, {
          ...getDefaultContextData(),
          featureName:
            getActiveStanzaEntry('stz-feat') ?? options.feature ?? '',
          guardName: options.guard,
          duration,
        });
      },
    }) as Fn<TArgs, Promisify<TReturn>>;
  });
};

function getDefaultContextData() {
  const customerId = getServiceConfig()?.config.customerId;
  const { serviceName, environment, clientId } =
    hubService.getServiceMetadata();
  return {
    serviceName,
    environment,
    clientId,
    customerId,
  };
}

function getGuardMode(guardName: string) {
  const guardConfig = getGuardConfig(guardName)?.config;
  return guardConfig?.reportOnly === true
    ? 'report_only'
    : guardConfig?.reportOnly === false
    ? 'normal'
    : 'unspecified';
}

const createStanzaGuard = (options: StanzaGuardOptions) => {
  const initializedGuard = initOrGetGuard(options);
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
