import { InstrumentationBase } from '@opentelemetry/instrumentation'
import { type Counter, type Histogram, type MetricOptions, ValueType } from '@opentelemetry/api'
import { eventBus, events } from '../../global/eventBus'
import { eventDataToRequestAttributes, type RequestAttributes } from './requestAttributes'
import { eventDataToRequestBlockedAttributes, type RequestBlockedAttributes } from './requestBlockedAttributes'
import { type DefaultContextAttributes, eventDataToDefaultContextAttributes } from './defaultContextAttributes'
import {
  type GuardAttributes,
  eventDataToGuardAttributes,
  eventDataToOptionalGuardAttributes
} from './guardAttributes'
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
      guard: {
        fetchOk: Counter<DefaultContextAttributes & GuardAttributes>
        fetchFailed: Counter<DefaultContextAttributes>
        fetchLatency: Histogram<DefaultContextAttributes>
      }
    }
    quota: {
      fetchOk: Counter<DefaultContextAttributes & Partial<GuardAttributes> & { endpoint: QuotaEndpoint }>
      fetchFailed: Counter<DefaultContextAttributes & { endpoint: QuotaEndpoint }>
      fetchLatency: Histogram<DefaultContextAttributes & { endpoint: QuotaEndpoint }>
      validateOk: Counter<DefaultContextAttributes & GuardAttributes>
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
        stanzaCounterMetricOptions('Count of requests permitted to execute on a given Guard')
      ),
      blocked: this.meter.createCounter(
        events.request.blocked.description ?? '',
        stanzaCounterMetricOptions('Count of requests not permitted to execute on a given Guard')
      ),
      failed: this.meter.createCounter(
        events.request.failed.description ?? '',
        stanzaCounterMetricOptions('Count of failed requests traversing a particular Guard')
      ),
      succeeded: this.meter.createCounter(
        events.request.succeeded.description ?? '',
        stanzaCounterMetricOptions('Count of successful requests traversing a particular Guard')
      ),
      latency: this.meter.createHistogram(
        events.request.latency.description ?? '',
        stanzaHistogramMetricOptions('Latency histogram for execution time for a particular Guard')
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
    eventBus.on(events.config.guard.fetchOk, data => {
      this.metrics.config.guard.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToGuardAttributes(data)
      })
    })
    eventBus.on(events.config.guard.fetchFailed, data => {
      this.metrics.config.guard.fetchFailed.add(1, eventDataToDefaultContextAttributes(data))
    })
    eventBus.on(events.config.guard.fetchLatency, ({ latency, ...data }) => {
      this.metrics.config.guard.fetchLatency.record(latency, eventDataToDefaultContextAttributes(data))
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
      guard: {
        fetchOk: this.meter.createCounter(
          events.config.guard.fetchOk.description ?? '',
          stanzaCounterMetricOptions('Count of successful fetches of guard configuration')
        ),
        fetchFailed: this.meter.createCounter(
          events.config.guard.fetchFailed.description ?? '',
          stanzaCounterMetricOptions('Count of unsuccessful fetches of guard configuration')
        ),
        fetchLatency: this.meter.createHistogram(
          events.config.guard.fetchLatency.description ?? '',
          stanzaHistogramMetricOptions('Latency histogram for time to fetch guard configuration')
        )
      }
    }
  }

  private initQuotaMetrics () {
    eventBus.on(events.quota.fetchOk, data => {
      this.metrics.quota.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToOptionalGuardAttributes(data),
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
        ...eventDataToGuardAttributes(data)
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
