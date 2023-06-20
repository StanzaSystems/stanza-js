import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { type ServiceConfig } from '../../hub/model'
import { Metadata } from '@grpc/grpc-js'
import { eventBus, events } from '../../global/eventBus'
import { hubService } from '../../global/hubService'

export class StanzaSpanExporter extends OTLPTraceExporter {
  constructor (traceConfig: ServiceConfig['config']['traceConfig']) {
    const metadata = new Metadata()
    super({
      url: traceConfig.collectorUrl,
      metadata
    })
  }

  override send (...[objects, onSuccess, onError]: Parameters<OTLPTraceExporter['send']>) {
    const stanzaOnSuccess: typeof onSuccess = () => {
      eventBus.emit(events.telemetry.sendOk, {
        ...hubService.getServiceMetadata(),
        oTelAddress: this.url
      }).catch(() => {})
      onSuccess()
    }

    const stanzaOnError: typeof onError = (error) => {
      eventBus.emit(events.telemetry.sendFailed, {
        ...hubService.getServiceMetadata(),
        oTelAddress: this.url
      }).catch(() => {})
      onError(error)
    }

    super.send(objects, stanzaOnSuccess, stanzaOnError)
  }
}
