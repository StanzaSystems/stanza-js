import { beforeEach, describe, expect, it, type SpyInstance, vi } from 'vitest'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { type Counter, type Histogram, type Meter, type MeterProvider as IMeterProvider } from '@opentelemetry/api'
import type * as eventBusModule from '../../global/eventBus'
import { eventBus, events } from '../../global/eventBus'
import { StanzaInstrumentation } from './stanzaInstrumentation'

type EventBusModule = typeof eventBusModule
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
          event: events.request.allowed,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.request.allowed',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.request.blocked,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            reason: 'quota'
          }
        },
        expected: {
          metric: 'stanza.request.blocked',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              reason: 'quota'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.request.failed,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.request.failed',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.request.succeeded,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.request.succeeded',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.request.latency,
          data: {
            latency: 123.456,
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.request.latency',
          data: [
            123.456,
            {
              decorator: 'testDecorator',
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
          metric: 'stanza.config.service.fetch_ok',
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
          metric: 'stanza.config.service.fetch_failed',
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
          event: events.config.service.fetchLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch_latency',
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
      // decorator config events
      {
        given: {
          event: events.config.decorator.fetchOk,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.config.decorator.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_failed',
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
          event: events.config.decorator.fetchLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_latency',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_failed',
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
          event: events.quota.fetchLatency,
          data: {
            latency: 123.456,
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_latency',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.quota.validate_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          metric: 'stanza.quota.validate_failed',
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
          event: events.quota.validateLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId'
          }
        },
        expected: {
          metric: 'stanza.quota.validate_latency',
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
          metric: 'stanza.telemetry.send_ok',
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
          metric: 'stanza.telemetry.send_failed',
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
          event: events.request.allowed,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.request.allowed',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          event: events.request.blocked,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            reason: 'quota'
          }
        },
        expected: {
          metric: 'stanza.request.blocked',
          data: [
            1,
            {
              decorator: 'testDecorator',
              service: 'testService',
              environment: 'testEnvironment',
              client_id: 'testClientId',
              customer_id: 'testCustomerId',
              reason: 'quota'
            }],
          metricType: 'counter'
        }
      },
      {
        given: {
          event: events.request.failed,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.request.failed',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          event: events.request.succeeded,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.request.succeeded',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          event: events.request.latency,
          data: {
            latency: 123.456,
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.request.latency',
          data: [
            123.456,
            {
              decorator: 'testDecorator',
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
          metric: 'stanza.config.service.fetch_ok',
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
          metric: 'stanza.config.service.fetch_failed',
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
          event: events.config.service.fetchLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.service.fetch_latency',
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
      // decorator config events
      {
        given: {
          event: events.config.decorator.fetchOk,
          data: {
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          event: events.config.decorator.fetchFailed,
          data: {
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_failed',
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
          event: events.config.decorator.fetchLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.config.decorator.fetch_latency',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_failed',
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
          event: events.quota.fetchLatency,
          data: {
            latency: 123.456,
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId',
            endpoint: 'GetToken'
          }
        },
        expected: {
          metric: 'stanza.quota.fetch_latency',
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
            decoratorName: 'testDecorator',
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.quota.validate_ok',
          data: [
            1,
            {
              decorator: 'testDecorator',
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
          metric: 'stanza.quota.validate_failed',
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
          event: events.quota.validateLatency,
          data: {
            latency: 123.456,
            serviceName: 'testService',
            environment: 'testEnvironment',
            clientId: 'testClientId',
            customerId: 'testCustomerId'
          }
        },
        expected: {
          metric: 'stanza.quota.validate_latency',
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
          metric: 'stanza.telemetry.send_ok',
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
          metric: 'stanza.telemetry.send_failed',
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
