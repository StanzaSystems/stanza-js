import { InstrumentationBase } from '@opentelemetry/instrumentation'
import {
  type Counter,
  type Histogram,
  type MetricOptions,
  ValueType
} from '@opentelemetry/api'
import { eventBus, events } from '../../global/eventBus'
import {
  eventDataToRequestAttributes,
  type RequestAttributes
} from './requestAttributes'
import {
  eventDataToGuardResolutionAttributes,
  type GuardResolutionAttributes
} from './guardResolutionAttributes'
import {
  type DefaultContextAttributes,
  eventDataToDefaultContextAttributes
} from './defaultContextAttributes'
import {
  type GuardAttributes,
  eventDataToGuardAttributes,
  eventDataToOptionalGuardAttributes
} from './guardAttributes'
import { packageName, packageVersion } from '../../meta'

type QuotaEndpoint = 'GetToken' | 'GetTokenLease' | 'SetTokenLeaseConsumed'

export class StanzaInstrumentation extends InstrumentationBase {
  private metrics!: {
    guard: {
      allowed: Counter<GuardResolutionAttributes>
      blocked: Counter<GuardResolutionAttributes>
      failOpen: Counter<GuardResolutionAttributes>
      failed: Counter<RequestAttributes>
      succeeded: Counter<RequestAttributes>
      duration: Histogram<RequestAttributes>
    }
    config: {
      service: {
        fetchOk: Counter<DefaultContextAttributes>
        fetchFailed: Counter<DefaultContextAttributes>
        fetchDuration: Histogram<DefaultContextAttributes>
      }
      guard: {
        fetchOk: Counter<DefaultContextAttributes & GuardAttributes>
        fetchFailed: Counter<DefaultContextAttributes>
        fetchDuration: Histogram<DefaultContextAttributes>
      }
    }
    quota: {
      fetchOk: Counter<
        DefaultContextAttributes &
          Partial<GuardAttributes> & { endpoint: QuotaEndpoint }
      >
      fetchFailed: Counter<
        DefaultContextAttributes & { endpoint: QuotaEndpoint }
      >
      fetchDuration: Histogram<
        DefaultContextAttributes & { endpoint: QuotaEndpoint }
      >
      validateOk: Counter<DefaultContextAttributes & GuardAttributes>
      validateFailed: Counter<DefaultContextAttributes>
      validateDuration: Histogram<DefaultContextAttributes>
    }
    telemetry: {
      sendOk: Counter<DefaultContextAttributes & { otel_address: string }>
      sendFailed: Counter<DefaultContextAttributes & { otel_address: string }>
    }
  }

  constructor() {
    super(packageName, packageVersion)
  }

  protected init(): void {
    this.initRequestMetrics()
    this.initConfigMetrics()
    this.initQuotaMetrics()
    this.initTelemetryMetrics()
  }

  protected override _updateMetricInstruments() {
    this.metrics = {
      guard: this.updateRequestMetrics(),
      config: this.updateConfigMetrics(),
      quota: this.updateQuotaMetrics(),
      telemetry: this.updateTelemetryMetrics()
    }
  }

  private initRequestMetrics() {
    eventBus.on(events.guard.allowed, (data) => {
      this.metrics.guard.allowed.add(
        1,
        eventDataToGuardResolutionAttributes(data)
      )
    })
    eventBus.on(events.guard.failOpen, (data) => {
      this.metrics.guard.failOpen.add(
        1,
        eventDataToGuardResolutionAttributes(data)
      )
    })
    eventBus.on(events.guard.blocked, (data) => {
      this.metrics.guard.blocked.add(
        1,
        eventDataToGuardResolutionAttributes(data)
      )
    })
    eventBus.on(events.guard.failed, (data) => {
      this.metrics.guard.failed.add(1, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.guard.succeeded, (data) => {
      this.metrics.guard.succeeded.add(1, eventDataToRequestAttributes(data))
    })
    eventBus.on(events.guard.duration, ({ duration, ...data }) => {
      this.metrics.guard.duration.record(
        duration,
        eventDataToRequestAttributes(data)
      )
    })
  }

  private updateRequestMetrics(): typeof this.metrics.guard {
    return {
      allowed: this.meter.createCounter(
        events.guard.allowed.description ?? '',
        stanzaCounterMetricOptions(
          'Count of requests permitted to execute on a given Guard'
        )
      ),
      blocked: this.meter.createCounter(
        events.guard.blocked.description ?? '',
        stanzaCounterMetricOptions(
          'Count of requests not permitted to execute on a given Guard'
        )
      ),
      failOpen: this.meter.createCounter(
        events.guard.failOpen.description ?? '',
        stanzaCounterMetricOptions(
          'Count of requests which encountered an error condition, but were allowed to proceed anyway'
        )
      ),
      failed: this.meter.createCounter(
        events.guard.failed.description ?? '',
        stanzaCounterMetricOptions(
          'Count of failed requests traversing a particular Guard'
        )
      ),
      succeeded: this.meter.createCounter(
        events.guard.succeeded.description ?? '',
        stanzaCounterMetricOptions(
          'Count of successful requests traversing a particular Guard'
        )
      ),
      duration: this.meter.createHistogram(
        events.guard.duration.description ?? '',
        stanzaHistogramMetricOptions(
          'Duration histogram for execution time for a particular Guard'
        )
      )
    }
  }

  private initConfigMetrics() {
    eventBus.on(events.config.service.fetchOk, (data) => {
      this.metrics.config.service.fetchOk.add(
        1,
        eventDataToDefaultContextAttributes(data)
      )
    })
    eventBus.on(events.config.service.fetchFailed, (data) => {
      this.metrics.config.service.fetchFailed.add(
        1,
        eventDataToDefaultContextAttributes(data)
      )
    })
    eventBus.on(
      events.config.service.fetchDuration,
      ({ duration, ...data }) => {
        this.metrics.config.service.fetchDuration.record(
          duration,
          eventDataToDefaultContextAttributes(data)
        )
      }
    )
    eventBus.on(events.config.guard.fetchOk, (data) => {
      this.metrics.config.guard.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToGuardAttributes(data)
      })
    })
    eventBus.on(events.config.guard.fetchFailed, (data) => {
      this.metrics.config.guard.fetchFailed.add(
        1,
        eventDataToDefaultContextAttributes(data)
      )
    })
    eventBus.on(events.config.guard.fetchDuration, ({ duration, ...data }) => {
      this.metrics.config.guard.fetchDuration.record(
        duration,
        eventDataToDefaultContextAttributes(data)
      )
    })
  }

  private updateConfigMetrics(): typeof this.metrics.config {
    return {
      service: {
        fetchOk: this.meter.createCounter(
          events.config.service.fetchOk.description ?? '',
          stanzaCounterMetricOptions(
            'Count of successful fetches of service configuration'
          )
        ),
        fetchFailed: this.meter.createCounter(
          events.config.service.fetchFailed.description ?? '',
          stanzaCounterMetricOptions(
            'Count of unsuccessful fetches of service configuration'
          )
        ),
        fetchDuration: this.meter.createHistogram(
          events.config.service.fetchDuration.description ?? '',
          stanzaHistogramMetricOptions(
            'Duration histogram for time to fetch service configuration'
          )
        )
      },
      guard: {
        fetchOk: this.meter.createCounter(
          events.config.guard.fetchOk.description ?? '',
          stanzaCounterMetricOptions(
            'Count of successful fetches of guard configuration'
          )
        ),
        fetchFailed: this.meter.createCounter(
          events.config.guard.fetchFailed.description ?? '',
          stanzaCounterMetricOptions(
            'Count of unsuccessful fetches of guard configuration'
          )
        ),
        fetchDuration: this.meter.createHistogram(
          events.config.guard.fetchDuration.description ?? '',
          stanzaHistogramMetricOptions(
            'Duration histogram for time to fetch guard configuration'
          )
        )
      }
    }
  }

  private initQuotaMetrics() {
    eventBus.on(events.quota.fetchOk, (data) => {
      this.metrics.quota.fetchOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToOptionalGuardAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.fetchFailed, (data) => {
      this.metrics.quota.fetchFailed.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.fetchDuration, ({ duration, ...data }) => {
      this.metrics.quota.fetchDuration.record(duration, {
        ...eventDataToDefaultContextAttributes(data),
        endpoint: data.endpoint
      })
    })
    eventBus.on(events.quota.validateOk, (data) => {
      this.metrics.quota.validateOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        ...eventDataToGuardAttributes(data)
      })
    })
    eventBus.on(events.quota.validateFailed, (data) => {
      this.metrics.quota.validateFailed.add(
        1,
        eventDataToDefaultContextAttributes(data)
      )
    })
    eventBus.on(events.quota.validateDuration, ({ duration, ...data }) => {
      this.metrics.quota.validateDuration.record(
        duration,
        eventDataToDefaultContextAttributes(data)
      )
    })
  }

  private updateQuotaMetrics(): typeof this.metrics.quota {
    return {
      fetchOk: this.meter.createCounter(
        events.quota.fetchOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful fetches of quota')
      ),
      fetchFailed: this.meter.createCounter(
        events.quota.fetchFailed.description ?? '',
        stanzaCounterMetricOptions('Count of unsuccessful fetches quota')
      ),
      fetchDuration: this.meter.createHistogram(
        events.quota.fetchDuration.description ?? '',
        stanzaHistogramMetricOptions(
          'Duration histogram for time to fetch quota'
        )
      ),
      validateOk: this.meter.createCounter(
        events.quota.validateOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful token validations')
      ),
      validateFailed: this.meter.createCounter(
        events.quota.validateFailed.description ?? '',
        stanzaCounterMetricOptions('Count of unsuccessful token validations')
      ),
      validateDuration: this.meter.createHistogram(
        events.quota.validateDuration.description ?? '',
        stanzaHistogramMetricOptions(
          'Duration histogram for time to perform token validations'
        )
      )
    }
  }

  private initTelemetryMetrics() {
    eventBus.on(events.telemetry.sendOk, (data) => {
      this.metrics.telemetry.sendOk.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        otel_address: data.oTelAddress
      })
    })
    eventBus.on(events.telemetry.sendFailed, (data) => {
      this.metrics.telemetry.sendFailed.add(1, {
        ...eventDataToDefaultContextAttributes(data),
        otel_address: data.oTelAddress
      })
    })
  }

  private updateTelemetryMetrics(): typeof this.metrics.telemetry {
    return {
      sendOk: this.meter.createCounter(
        events.telemetry.sendOk.description ?? '',
        stanzaCounterMetricOptions('Count of successful telemetry send events')
      ),
      sendFailed: this.meter.createCounter(
        events.telemetry.sendFailed.description ?? '',
        stanzaCounterMetricOptions(
          'Count of unsuccessful telemetry send events'
        )
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
