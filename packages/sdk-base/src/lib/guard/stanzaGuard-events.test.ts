import { afterEach, type Mock } from 'vitest';
import { updateGuardConfig } from '../global/guardConfig';
import { mockHubService } from '../__tests__/mocks/mockHubService';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { context, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { type GuardConfig } from '@getstanza/hub-client-api';
import { stanzaGuard } from './stanzaGuard';
import { eventBus, events } from '../global/eventBus';
import type * as getQuotaModule from '../quota/getQuota';
import type * as quotaCheckerModule from '../guard/guard/quotaChecker';
import type * as ingressTokenValidatorModule from '../guard/guard/ingressTokenValidator';
import { updateServiceConfig } from '../global/serviceConfig';
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey';
import { TimeoutError } from '@getstanza/sdk-utils';
import { initIngressTokenValidator } from './guard/ingressTokenValidator';
import { initQuotaChecker } from './guard/quotaChecker';
import { addPriorityBoostToContext } from '../context/priorityBoost';

type GetQuotaModule = typeof getQuotaModule;
type QuotaCheckerModule = typeof quotaCheckerModule;
type IngressTokenValidatorModule = typeof ingressTokenValidatorModule;

const mockMessageBusEmit = vi.spyOn(eventBus, 'emit');

const doStuff = vi.fn();

vi.mock('../quota/getQuota', () => {
  return {
    getQuota: async (...args) => getQuotaMock(...args),
  } satisfies GetQuotaModule;
});

vi.mock('./guard/quotaChecker', async (importOriginal) => {
  const original = await importOriginal<QuotaCheckerModule>();
  return {
    ...original,
    initQuotaChecker: vi.fn((...args) => original.initQuotaChecker(...args)),
  } satisfies QuotaCheckerModule;
});

vi.mock('./guard/ingressTokenValidator', async (importOriginal) => {
  const original = await importOriginal<IngressTokenValidatorModule>();
  return {
    ...original,
    initIngressTokenValidator: vi.fn((...args) =>
      original.initIngressTokenValidator(...args)
    ),
  } satisfies IngressTokenValidatorModule;
});

type GetQuotaFn = GetQuotaModule['getQuota'];
type GetQuotaFnParameters = Parameters<GetQuotaFn>;
type GetQuotaFnReturnType = ReturnType<GetQuotaFn>;

const initQuotaCheckerMock = vi.mocked(initQuotaChecker);
const initIngressTokenValidatorMock = vi.mocked(initIngressTokenValidator);

const getQuotaMock = Object.assign(
  vi.fn<GetQuotaFnParameters, GetQuotaFnReturnType>(async () => {
    throw Error('not implemented');
  }),
  {
    mockImplementationDeferred: function (
      this: Mock<GetQuotaFnParameters, GetQuotaFnReturnType>
    ) {
      const deferred: {
        resolve: (value: Awaited<GetQuotaFnReturnType>) => void;
        reject: (reason: unknown) => void;
      } = {
        resolve: () => {},
        reject: () => {},
      };
      this.mockImplementation((): any => {
        return new Promise<Awaited<GetQuotaFnReturnType>>((resolve, reject) => {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
      });

      return deferred;
    },
  }
);

beforeEach(() => {
  updateGuardConfig('testGuard', undefined as any);
  updateServiceConfig(undefined);

  mockMessageBusEmit.mockReset();

  doStuff.mockReset();
  getQuotaMock.mockReset();
  getQuotaMock.mockImplementation(async () => {
    throw Error('not implemented');
  });
  mockHubService.reset();
  mockHubService.getServiceMetadata.mockImplementation(() => ({
    serviceName: 'testService',
    serviceRelease: '1.0.0',
    environment: 'testEnvironment',
    clientId: 'testClientId',
  }));
});

afterEach(() => {
  vi.useRealTimers();
});

beforeAll(() => {
  const contextManager = new AsyncHooksContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);
});

describe('stanzaGuard', () => {
  describe('events', () => {
    describe.each([false, true])(
      "with reportOnly mode set to '%s'",
      (reportOnly) => {
        describe('should emit stanza.guard.allowed event', () => {
          it('when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('with specified feature when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              feature: 'testFeature',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: 'testFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('with feature specified in context when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithBaggage = propagation.setBaggage(
              ROOT_CONTEXT,
              propagation.createBaggage({
                'stz-feat': { value: 'testBaggageFeature' },
              })
            );

            const guardStuffPromise = context.with(
              contextWithBaggage,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: 'testBaggageFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('with specified priority boost when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 1,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('with priority boost specified in context when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithBoost = addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 2,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('with priority boost specified in guard and context when guard executes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const contextWithBoost = addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.allowed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 3,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });
        });

        describe('should emit stanza.guard.failopen event', () => {
          it('when guard executes with fail open reason when no guard config is provided', async () => {
            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_UNSPECIFIED',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_NOT_EVAL',
                quotaReason: 'QUOTA_NOT_EVAL',
                mode: 'unspecified',
              }
            );
          });

          it('when checking quota returns null', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve(null);

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_ERROR',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when checking quota times out', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.reject(new TimeoutError(1000, 'Check quota timed out'));

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_TIMEOUT',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when checking quota throws', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            initQuotaCheckerMock.mockImplementationOnce(() => ({
              checkQuota: async () => {
                throw new Error('internal error');
              },
              shouldCheckQuota: () => true,
            }));

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_LOCAL_ERROR',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when validating token times out', async () => {
            vi.useFakeTimers();

            updateGuardConfig('testGuard', {
              config: {
                validateIngressTokens: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            mockHubService.validateToken.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = context.with(
              context.active().setValue(stanzaTokenContextKey, 'tokenKey'),
              guardedDoStuff
            );

            await vi.advanceTimersByTimeAsync(1000);

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_VALIDATION_TIMEOUT',
                quotaReason: 'QUOTA_EVAL_DISABLED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when validating token throws', async () => {
            updateGuardConfig('testGuard', {
              config: {
                validateIngressTokens: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            initIngressTokenValidatorMock.mockImplementationOnce(() => ({
              validateIngressToken: async () => {
                throw new Error('internal error');
              },
              shouldValidateIngressToken: () => true,
            }));

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_VALIDATION_ERROR',
                quotaReason: 'QUOTA_EVAL_DISABLED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when both validating token and checking quota throws', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                validateIngressTokens: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            initIngressTokenValidatorMock.mockImplementationOnce(() => ({
              validateIngressToken: async () => {
                throw new Error('internal error');
              },
              shouldValidateIngressToken: () => true,
            }));
            initQuotaCheckerMock.mockImplementationOnce(() => ({
              checkQuota: async () => {
                throw new Error('internal error');
              },
              shouldCheckQuota: () => true,
            }));

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_VALIDATION_ERROR',
                quotaReason: 'QUOTA_LOCAL_ERROR',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when validating token throws and checking quota passes', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                validateIngressTokens: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            initIngressTokenValidatorMock.mockImplementationOnce(() => ({
              validateIngressToken: async () => {
                throw new Error('internal error');
              },
              shouldValidateIngressToken: () => true,
            }));
            initQuotaCheckerMock.mockImplementationOnce(() => ({
              checkQuota: async () => {
                return Promise.resolve({
                  type: 'QUOTA',
                  status: 'success',
                  reason: {
                    quotaReason: 'QUOTA_GRANTED',
                  },
                  token: 'token',
                } as const);
              },
              shouldCheckQuota: () => true,
            }));

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_VALIDATION_ERROR',
                quotaReason: 'QUOTA_GRANTED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it('when validating token passes and checking quota throws', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                validateIngressTokens: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            initIngressTokenValidatorMock.mockImplementationOnce(() => ({
              validateIngressToken: async () => {
                return Promise.resolve({
                  type: 'TOKEN_VALIDATE',
                  status: 'success',
                  reason: {
                    tokenReason: 'TOKEN_VALID',
                  },
                } as const);
              },
              shouldValidateIngressToken: () => true,
            }));
            initQuotaCheckerMock.mockImplementationOnce(() => ({
              checkQuota: async () => {
                throw new Error('internal error');
              },
              shouldCheckQuota: () => true,
            }));

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failOpen,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_VALID',
                quotaReason: 'QUOTA_LOCAL_ERROR',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });
        });

        describe('should emit stanza.guard.blocked event', () => {
          it("when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it("with specified feature when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              feature: 'testFeature',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: 'testFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it("with feature specified in context when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithBaggage = propagation.setBaggage(
              ROOT_CONTEXT,
              propagation.createBaggage({
                'stz-feat': { value: 'testBaggageFeature' },
              })
            );

            const guardStuffPromise = context.with(
              contextWithBaggage,
              guardedDoStuff
            );

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: 'testBaggageFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it("with specified priority boost when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 1,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it("with priority boost specified in context when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 2,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });

          it("with priority boost specified in guard and context when guard's execution is blocked", async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: false });

            if (reportOnly) {
              await expect(guardStuffPromise).resolves.toBeUndefined();
            } else {
              await expect(guardStuffPromise).rejects.toThrow();
            }

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.blocked,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 3,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
                configState: 'CONFIG_CACHED_OK',
                localReason: 'LOCAL_NOT_SUPPORTED',
                tokenReason: 'TOKEN_EVAL_DISABLED',
                quotaReason: 'QUOTA_BLOCKED',
                mode: reportOnly ? 'report_only' : 'normal',
              }
            );
          });
        });

        describe('should emit stanza.guard.succeeded event', () => {
          it('when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with specified feature when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              feature: 'testFeature',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: 'testFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with feature specified in context when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithBaggage = propagation.setBaggage(
              ROOT_CONTEXT,
              propagation.createBaggage({
                'stz-feat': { value: 'testBaggageFeature' },
              })
            );

            const guardStuffPromise = context.with(
              contextWithBaggage,
              guardedDoStuff
            );

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: 'testBaggageFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with specified priority boost when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 1,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with priority boost specified in context when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 2,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with priority boost specified in guard and context when function wrapped with a guard succeeds', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            mockMessageBusEmit.mockReset();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.succeeded,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 3,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });
        });

        describe('should emit stanza.guard.failed event', () => {
          it('when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(() => {
              throw new Error('kaboom');
            });

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with specified feature when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              feature: 'testFeature',
            }).bind(() => {
              throw new Error('kaboom');
            });

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: 'testFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with feature specified in context when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(() => {
              throw new Error('kaboom');
            });

            const contextWithBaggage = propagation.setBaggage(
              ROOT_CONTEXT,
              propagation.createBaggage({
                'stz-feat': { value: 'testBaggageFeature' },
              })
            );

            const guardStuffPromise = context.with(
              contextWithBaggage,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: 'testBaggageFeature',
                priorityBoost: 0,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with specified priority boost when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(() => {
              throw new Error('kaboom');
            });

            const guardStuffPromise = guardedDoStuff();

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 1,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with priority boost specified in context when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(() => {
              throw new Error('kaboom');
            });

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 2,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });

          it('with priority boost specified in guard and context when function wrapped with a guard fails', async () => {
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(() => {
              throw new Error('kaboom');
            });

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).rejects.toThrow('kaboom');

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.failed,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 3,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );
          });
        });

        describe('should emit stanza.guard.duration event', () => {
          it('when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 0,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });

          it('with specified feature when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              feature: 'testFeature',
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: 'testFeature',
                priorityBoost: 0,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });

          it('with feature specified in context when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithBaggage = propagation.setBaggage(
              ROOT_CONTEXT,
              propagation.createBaggage({
                'stz-feat': { value: 'testBaggageFeature' },
              })
            );

            const guardStuffPromise = context.with(
              contextWithBaggage,
              guardedDoStuff
            );

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: 'testBaggageFeature',
                priorityBoost: 0,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });

          it('with specified priority boost when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const guardStuffPromise = guardedDoStuff();

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 1,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });

          it('with priority boost specified in context when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 2,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });

          it('with priority boost specified in guard and context when function wrapped with a guard succeeds', async () => {
            vi.useFakeTimers({
              now: 0,
            });
            updateGuardConfig('testGuard', {
              config: {
                checkQuota: true,
                reportOnly,
              } satisfies Partial<GuardConfig['config']> as any,
              version: 'testGuardVersion',
            });

            const deferred = getQuotaMock.mockImplementationDeferred();

            const guardedDoStuff = stanzaGuard({
              guard: 'testGuard',
              priorityBoost: 1,
            }).bind(doStuff);

            const contextWithPriorityBoost =
              addPriorityBoostToContext(2)(ROOT_CONTEXT);

            const guardStuffPromise = context.with(
              contextWithPriorityBoost,
              guardedDoStuff
            );

            await vi.advanceTimersByTimeAsync(123.456);

            deferred.resolve({ granted: true, token: 'testToken' });

            await expect(guardStuffPromise).resolves.toBeUndefined();

            expect(mockMessageBusEmit).toHaveBeenCalledWith(
              events.guard.duration,
              {
                guardName: 'testGuard',
                featureName: '',
                priorityBoost: 3,
                duration: 123.456,
                serviceName: 'testService',
                environment: 'testEnvironment',
                clientId: 'testClientId',
              }
            );

            vi.useRealTimers();
          });
        });
      }
    );
  });
});
