import { InstrumentationBase } from '@opentelemetry/instrumentation'
import { type Attributes, type Counter, type Histogram } from '@opentelemetry/api'
import { events, messageBus } from '../../global/messageBus'

export class StanzaInstrumentation extends InstrumentationBase {
  private metrics!: {
    request: {
      allowed: Counter
      blocked: Counter
      failed: Counter
      succeeded: Counter
      latency: Histogram
    }
  }

  constructor () {
    super('@getstanza/node', '0.0.0')
  }

  protected init (): void {}

  protected _updateMetricInstruments () {
    this.metrics = {
      request: {
        allowed: this.meter.createCounter(events.request.allowed.description ?? ''),
        blocked: this.meter.createCounter(events.request.blocked.description ?? ''),
        failed: this.meter.createCounter(events.request.failed.description ?? ''),
        succeeded: this.meter.createCounter(events.request.succeeded.description ?? ''),
        latency: this.meter.createHistogram(events.request.latency.description ?? '')
      }
    }

    messageBus.on(events.request.allowed, data => {
      const attributes: Attributes = data
      this.metrics.request.allowed.add(1, attributes)
    })
    messageBus.on(events.request.blocked, data => {
      const attributes: Attributes = data
      this.metrics.request.blocked.add(1, attributes)
    })
    messageBus.on(events.request.failed, data => {
      const attributes: Attributes = data
      this.metrics.request.failed.add(1, attributes)
    })
    messageBus.on(events.request.succeeded, data => {
      const attributes: Attributes = data
      this.metrics.request.succeeded.add(1, attributes)
    })
    messageBus.on(events.request.latency, ({ latency, ...data }) => {
      const attributes: Attributes = data
      this.metrics.request.latency.record(latency, attributes)
    })
    messageBus.on(events.request.allowed, data => {
      const attributes: Attributes = data
      this.metrics.request.allowed.add(1, attributes)
    })
  }
}
