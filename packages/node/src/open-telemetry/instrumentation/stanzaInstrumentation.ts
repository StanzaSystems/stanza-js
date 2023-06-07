import { InstrumentationBase } from '@opentelemetry/instrumentation'
import { type Counter, type Histogram, type MetricOptions, ValueType } from '@opentelemetry/api'
import { eventBus, events } from '../../global/eventBus'
import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'
import { eventDataToRequestBlockedAttributes, type RequestBlockedAttributes } from './requestBlockedAttributes'
import { type DefaultContextAttributes, eventDataToDefaultContextAttributes } from './defaultContextAttributes'
import {
  type DecoratorAttributes,
  eventDataToDecoratorAttributes,
  eventDataToOptionalDecoratorAttributes
} from './decoratorAttributes'
import { packageName, packageVersion } from '../../meta'

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
      fetchOk: Counter<DefaultContextAttributes & Partial<DecoratorAttributes> & { endpoint: QuotaEndpoint }>
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
    super(packageName, packageVersion)
  }

  protected init (): void {
    this.initRequestMetrics()
    this.initConfigMetrics()
    this.initQuotaMetrics()
    this.initTelemetryMetrics()
  }

  protected override _updateMetricInstruments () {
    this.metrics = {
      request: this.updateRequestMetrics(),
      config: this.updateConfigMetrics(),
      quota: this.updateQuotaMetrics(),
      telemetry: this.updateTelemetryMetrics()
    }
  }

  private initRequestMetrics () {
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
  }

  private updateRequestMetrics (): typeof this.metrics.request {
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

  private initConfigMetrics () {
    eventBus.on(events.config.service.fetchOk, data => {
      this.metrics.config.service.fetchOk.add(1, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.config.service.fetchFailed, data => {
      this.metrics.config.service.fetchFailed.add(1, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.config.service.fetchLatency, ({ latency, ...data }) => {
      this.metrics.config.service.fetchLatency.record(latency, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.config.decorator.fetchOk, data => {
      this.metrics.config.decorator.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToDecoratorAttributes(data)
      })
    })
    eventBus.on(events.config.decorator.fetchFailed, data => {
      this.metrics.config.decorator.fetchFailed.add(1, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.config.decorator.fetchLatency, ({ latency, ...data }) => {
      this.metrics.config.decorator.fetchLatency.record(latency, eventDataToDefaultContextAttributes(data))
    })
  }

  private updateConfigMetrics (): typeof this.metrics.config {
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

  private initQuotaMetrics () {
    eventBus.on(events.quota.fetchOk, data => {
      this.metrics.quota.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToOptionalDecoratorAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.fetchFailed, data => {
      this.metrics.quota.fetchFailed.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.fetchLatency, ({ latency, ...data }) => {
      this.metrics.quota.fetchLatency.record(latency, {
        ...eventDataToDefaultContextAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.validateOk, data => {
      this.metrics.quota.validateOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToDecoratorAttributes(data)
      })
    })
    eventBus.on(events.quota.validateFailed, data => {
      this.metrics.quota.validateFailed.add(1, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.quota.validateLatency, ({ latency, ...data }) => {
      this.metrics.quota.validateLatency.record(latency, eventDataToDefaultContextAttributes(data))
    })
  }

  private updateQuotaMetrics (): typeof this.metrics.quota {
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

  private initTelemetryMetrics () {
    eventBus.on(events.telemetry.sendOk, data => {
      this.metrics.telemetry.sendOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        otel_address: data.oTelAddress
      })
    })
    eventBus.on(events.telemetry.sendFailed, data => {
      this.metrics.telemetry.sendFailed.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        otel_address: data.oTelAddress
      })
    })
  }

  private updateTelemetryMetrics (): typeof this.metrics.telemetry {
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
