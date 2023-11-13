import { beforeEach, describe, expect, it, type SpyInstance, vi } from 'vitest'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { type Counter, type Histogram, type Meter, type MeterProvider as IMeterProvider } from '@opentelemetry/api'
import type * as eventBusModule from '../../global/eventBus'
import { eventBus, events } from '../../global/eventBus'
import { StanzaInstrumentation } from './stanzaInstrumentation'

type EventBusModule = typeof eventBusModule
type ConfigState = eventBusModule.ConfigState
type LocalReason = eventBusModule.LocalReason
type TokenReason = eventBusModule.TokenReason
type QuotaReason = eventBusModule.QuotaReason
type GuardMode = eventBusModule.GuardMode

vi.mock('../../global/eventBus', async (_importOriginal) => {
  const Emittery = (await import('emittery')).default
  const original: any = await vi.importActual('../../global/eventBus')
  return {
    ...original,
    eventBus: new Emittery()
  } satisfies EventBusModule
})

describe('StanzaInstrumentation', () => {
  let instrumentation: StanzaInstrumentation
  let metricSpies: {
    counter: Record<string, SpyInstance<Parameters<Counter['add']>, ReturnType<Counter['add']>>>
    histogram: Record<string, SpyInstance<Parameters<Histogram['record']>, ReturnType<Histogram['record']>>>
  } = { counter: {}, histogram: {} }

  beforeEach(() => {
    instrumentation = new StanzaInstrumentation()
    metricSpies = { counter: {}, histogram: {} }
    const realMeterProvider = new MeterProvider()
    const meterProvider = {
      getMeter (...args) {
        const meter = realMeterProvider.getMeter(...args)
        return Object.setPrototypeOf({
          createCounter: function (name, ...args) {
            const counter = meter.createCounter(name, ...args)
            metricSpies.counter[name] = vi.spyOn(counter, 'add')
            return counter
          } satisfies Meter['createCounter'],
          createHistogram: function (name, ...args) {
            const histogram = meter.createHistogram(name, ...args)
            metricSpies.histogram[name] = vi.spyOn(histogram, 'record')
            return histogram
          } satisfies Meter['createHistogram']
        }, meter)
      }
    } satisfies IMeterProvider
    instrumentation.setMeterProvider(meterProvider)
  })

  describe('without customer id in service config', () => {
    it.each([
      {
        given: {
          event: events.guard.allowed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_VALID' satisfies TokenReason,
            quotaReason: 'QUOTA_GRANTED' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.allowed',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_VALID',
              quota_reason: 'QUOTA_GRANTED',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.failOpen,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_VALID' satisfies TokenReason,
            quotaReason: 'QUOTA_TIMEOUT' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.failopen',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_VALID',
              quota_reason: 'QUOTA_TIMEOUT',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.blocked,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_EVAL_DISABLED' satisfies TokenReason,
            quotaReason: 'QUOTA_BLOCKED' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.blocked',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_EVAL_DISABLED',
              quota_reason: 'QUOTA_BLOCKED',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.failed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.failure',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.succeeded,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.duration,
          data: {
            duration: 123.456,
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.duration',
          data: [
            123.456,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'histogram'
        }
      }
    ] as const)('should capture request metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data as any)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
    // service config events
      {
        given: {
          event: events.config.service.fetchOk,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.success',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.service.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.service.fetchDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'histogram'
        }
      },
      // guard config events
      {
        given: {
          event: events.config.guard.fetchOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.guard.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.guard.fetchDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'histogram'
        }
      }
    ] as const)('should capture service config metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
    // quota fetch events
      {
        given: {
          event: events.quota.fetchOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              endpoint: 'GetToken'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.fetchFailed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              endpoint: 'GetToken'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.fetchDuration,
          data: {
            duration: 123.456,
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              endpoint: 'GetToken'
            }],
          metricType: 'histogram'
        }
      },
      // quota validate events
      {
        given: {
          event: events.quota.validateOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.validateFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.validateDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'histogram'
        }
      }

    ] as const)('should capture quota metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
      {
        given: {
          event: events.telemetry.sendOk,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            oTelAddress: 'https://test.otel.address'
          }
        },
        expected: {
          metric: 'stanza.telemetry.success',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              otel_address: 'https://test.otel.address'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.telemetry.sendFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            oTelAddress: 'https://test.otel.address'
          }
        },
        expected: {
          metric: 'stanza.telemetry.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              otel_address: 'https://test.otel.address'
            }],
          metricType: 'counter'
        }
      }
    ] as const)('should capture telemetry metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })
  })

  describe('with customer id in service config', () => {
    it.each([
      {
        given: {
          event: events.guard.allowed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_VALID' satisfies TokenReason,
            quotaReason: 'QUOTA_GRANTED' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.allowed',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_VALID',
              quota_reason: 'QUOTA_GRANTED',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.failOpen,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_VALID' satisfies TokenReason,
            quotaReason: 'QUOTA_TIMEOUT' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.failopen',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_VALID',
              quota_reason: 'QUOTA_TIMEOUT',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.blocked,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            configState: 'CONFIG_CACHED_OK' satisfies ConfigState,
            localReason: 'LOCAL_NOT_SUPPORTED' satisfies LocalReason,
            tokenReason: 'TOKEN_EVAL_DISABLED' satisfies TokenReason,
            quotaReason: 'QUOTA_BLOCKED' satisfies QuotaReason,
            mode: 'normal' satisfies GuardMode
          }
        },
        expected: {
          metric: 'stanza.guard.blocked',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              config_state: 'CONFIG_CACHED_OK',
              local_reason: 'LOCAL_NOT_SUPPORTED',
              token_reason: 'TOKEN_EVAL_DISABLED',
              quota_reason: 'QUOTA_BLOCKED',
              mode: 'normal'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.failed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.failure',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.succeeded,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.guard.duration,
          data: {
            duration: 123.456,
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.guard.allowed.duration',
          data: [
            123.456,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'histogram'
        }
      }
    ] as const)('should capture request metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data as any)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
    // service config events
      {
        given: {
          event: events.config.service.fetchOk,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.success',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.service.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.service.fetchDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'histogram'
        }
      },
      // guard config events
      {
        given: {
          event: events.config.guard.fetchOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.guard.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.guard.fetchDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.guard.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'histogram'
        }
      }
    ] as const)('should capture service config metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
    // quota fetch events
      {
        given: {
          event: events.quota.fetchOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              endpoint: 'GetToken'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.fetchFailed,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              endpoint: 'GetToken'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.fetchDuration,
          data: {
            duration: 123.456,
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              endpoint: 'GetToken'
            }],
          metricType: 'histogram'
        }
      },
      // quota validate events
      {
        given: {
          event: events.quota.validateOk,
          data: {
            guardName: 'testGuard',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.success',
          data: [
            1,
            {
              guard: 'testGuard',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.validateFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.quota.validateDuration,
          data: {
            duration: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.quota.token.validate.duration',
          data: [
            123.456,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId'
            }],
          metricType: 'histogram'
        }
      }

    ] as const)('should capture quota metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })

    it.each([
      {
        given: {
          event: events.telemetry.sendOk,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            oTelAddress: 'https://test.otel.address'
          }
        },
        expected: {
          metric: 'stanza.telemetry.success',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              otel_address: 'https://test.otel.address'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.telemetry.sendFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            oTelAddress: 'https://test.otel.address'
          }
        },
        expected: {
          metric: 'stanza.telemetry.failure',
          data: [
            1,
            {
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              otel_address: 'https://test.otel.address'
            }],
          metricType: 'counter'
        }
      }
    ] as const)('should capture telemetry metrics', async ({ given, expected }) => {
      vi.useFakeTimers()
      void eventBus.emit(given.event, given.data)

      await vi.advanceTimersByTimeAsync(10)

      const metricSpy = metricSpies[expected.metricType][expected.metric]
      expect(metricSpy).toHaveBeenCalledOnce()
      expect(metricSpy).toHaveBeenCalledWith(...expected.data)

      vi.useRealTimers()
    })
  })
})
