import { InstrumentationBase } from '@opentelemetry/instrumentation'
import { type Counter, type Histogram, type MetricOptions, ValueType } from '@opentelemetry/api'
import { eventBus, events } from '../../global/eventBus'
import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'
import { eventDataToRequestBlockedAttributes, type RequestBlockedAttributes } from './requestBlockedAttributes'
import { type DefaultContextAttributes } from './defaultContextAttributes'
import { type DecoratorAttributes } from './decoratorAttributes'

type QuotaEndpoint = 'GetToken' | 'GetTokenLease' | 'SetTokenLeaseConsumed'

export class StanzaInstrumentation extends InstrumentationBase {
  private metrics!: {
    request: {
      allowed: Counter<RequestAttributes>
      blocked: Counter<RequestBlockedAttributes>
      failed: Counter<RequestAttributes>
      succeeded: Counter<RequestAttributes>
      latency: Histogram<RequestAttributes>
    }
    config: {
      service: {
        fetchOk: Counter<DefaultContextAttributes>
        fetchFailed: Counter<DefaultContextAttributes>
        fetchLatency: Histogram<DefaultContextAttributes>
      }
      decorator: {
        fetchOk: Counter<DefaultContextAttributes & DecoratorAttributes>
        fetchFailed: Counter<DefaultContextAttributes>
        fetchLatency: Histogram<DefaultContextAttributes>
      }
    }
    quota: {
      fetchOk: Counter<DefaultContextAttributes & DecoratorAttributes & { endpoint: QuotaEndpoint }>
      fetchFailed: Counter<DefaultContextAttributes & { endpoint: QuotaEndpoint }>
      fetchLatency: Histogram<DefaultContextAttributes & { endpoint: QuotaEndpoint }>
      validateOk: Counter<DefaultContextAttributes & DecoratorAttributes>
      validateFailed: Counter<DefaultContextAttributes>
      validateLatency: Histogram<DefaultContextAttributes>
    }
    telemetry: {
      sendOk: Counter<DefaultContextAttributes & { otel_address: string }>
      sendFailed: Counter<DefaultContextAttributes & { otel_address: string }>
    }
  }

  constructor () {
    super('@getstanza/node', '0.0.0')
  }

  protected init (): void {}

  protected _updateMetricInstruments () {
    this.metrics = {
      request: this.createRequestMetrics(),
      config: this.createConfigMetrics(),
      quota: this.createQuotaMetrics(),
      telemetry: this.createTelemetryMetrics()
    }

    eventBus.on(events.request.allowed, (data) => {
      this.metrics.request.allowed.add(1, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.request.blocked, data => {
      this.metrics.request.blocked.add(1, eventDataToRequestBlockedAttributes(data))
    })
    eventBus.on(events.request.failed, data => {
      this.metrics.request.failed.add(1, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.request.succeeded, data => {
      this.metrics.request.succeeded.add(1, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.request.latency, ({ latency, ...data }) => {
      this.metrics.request.latency.record(latency, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.request.allowed, data => {
      this.metrics.request.allowed.add(1, eventDataToRequestAttributes(data))
    })
  }

  private createRequestMetrics (): typeof this.metrics.request {
    return {
      allowed: this.meter.createCounter(
        events.request.allowed.description ?? '',
        stanzaCounterMetricOptions('Count of requests permitted to execute on a given Decorator')
      ),
      blocked: this.meter.createCounter(
        events.request.blocked.description ?? '',
        stanzaCounterMetricOptions('Count of requests not permitted to execute on a given Decorator')
      ),
      failed: this.meter.createCounter(
        events.request.failed.description ?? '',
        stanzaCounterMetricOptions('Count of failed requests traversing a particular Decorator')
      ),
      succeeded: this.meter.createCounter(
        events.request.succeeded.description ?? '',
        stanzaCounterMetricOptions('Count of successful requests traversing a particular Decorator')
      ),
      latency: this.meter.createHistogram(
        events.request.latency.description ?? '',
        stanzaHistogramMetricOptions('Latency histogram for execution time for a particular Decorator')
      )
    }
  }

  private createConfigMetrics (): typeof this.metrics.config {
    return {
      service: {
        fetchOk: this.meter.createCounter(
          events.config.service.fetchOk.description ?? '',
          stanzaCounterMetricOptions('Count of successful fetches of service configuration')
        ),
        fetchFailed: this.meter.createCounter(
          events.config.service.fetchFailed.description ?? '',
          stanzaCounterMetricOptions('Count of unsuccessful fetches of service configuration')
        ),
        fetchLatency: this.meter.createHistogram(
          events.config.service.fetchLatency.description ?? '',
          stanzaHistogramMetricOptions('Latency histogram for time to fetch service configuration')
        )
      },
      decorator: {
        fetchOk: this.meter.createCounter(
          events.config.decorator.fetchOk.description ?? '',
          stanzaCounterMetricOptions('Count of successful fetches of decorator configuration')
        ),
        fetchFailed: this.meter.createCounter(
          events.config.decorator.fetchFailed.description ?? '',
          stanzaCounterMetricOptions('Count of unsuccessful fetches of decorator configuration')
        ),
        fetchLatency: this.meter.createHistogram(
          events.config.decorator.fetchLatency.description ?? '',
          stanzaHistogramMetricOptions('Latency histogram for time to fetch decorator configuration')
        )
      }
    }
  }

  private createQuotaMetrics (): typeof this.metrics.quota {
    return {
      fetchOk: this.meter.createCounter(
        events.quota.fetchOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful fetches of quota')
      ),
      fetchFailed: this.meter.createCounter(
        events.quota.fetchFailed.description ?? '',
        stanzaCounterMetricOptions('Count of unsuccessful fetches quota')
      ),
      fetchLatency: this.meter.createHistogram(
        events.quota.fetchLatency.description ?? '',
        stanzaHistogramMetricOptions('Latency histogram for time to fetch quota')
      ),
      validateOk: this.meter.createCounter(
        events.quota.validateOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful token validations')
      ),
      validateFailed: this.meter.createCounter(
        events.quota.validateFailed.description ?? '',
        stanzaCounterMetricOptions('Count of unsuccessful token validations')
      ),
      validateLatency: this.meter.createHistogram(
        events.quota.validateLatency.description ?? '',
        stanzaHistogramMetricOptions('Latency histogram for time to perform token validations')
      )
    }
  }

  private createTelemetryMetrics (): typeof this.metrics.telemetry {
    return {
      sendOk: this.meter.createCounter(
        events.telemetry.sendOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful telemetry send events')
      ),
      sendFailed: this.meter.createCounter(
        events.telemetry.sendFailed.description ?? '',
        stanzaCounterMetricOptions('Count of unsuccessful telemetry send events')
      )
    }
  }
}

const stanzaCounterMetricOptions = (description: string): MetricOptions => ({
  description,
  unit: 'count',
  valueType: ValueType.INT
})
const stanzaHistogramMetricOptions = (description: string): MetricOptions => ({
  description,
  unit: 'milliseconds',
  valueType: ValueType.DOUBLE
})
