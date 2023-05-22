import { Metadata } from '@grpc/grpc-js'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { AggregationTemporality, InMemoryMetricExporter, type PushMetricExporter } from '@opentelemetry/sdk-metrics'
import { addServiceConfigListener, getServiceConfig } from '../../global/serviceConfig'
import { type ServiceConfig } from '../../hub/model'
import { type ExportResult, ExportResultCode } from '@opentelemetry/core'
import { eventBus, events } from '../../global/eventBus'
import { hubService } from '../../global/hubService'

export class StanzaMetricExporter implements PushMetricExporter {
  private exporter: InMemoryMetricExporter | OTLPMetricExporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE)
  private collectorUrl = ''
  constructor () {
    const serviceConfig = getServiceConfig()
    if (serviceConfig !== undefined) {
      this.updateExporter(serviceConfig)
    }
    addServiceConfigListener((config) => {
      this.updateExporter(config)
    })
  }

  private updateExporter ({ config: { metricConfig } }: ServiceConfig) {
    const metadata = new Metadata()
    metadata.add('x-stanza-key', metricConfig.collectorKey)
    const prevExporter = this.exporter
    this.exporter = new OTLPMetricExporter({
      url: metricConfig.collectorUrl,
      metadata
    })
    this.collectorUrl = metricConfig.collectorKey
    prevExporter.shutdown().catch(err => {
      console.log('Failed to shutdown a metric exporter:\n', err)
    })
  }

  export (...[metrics, originalCallback, ...restArgs]: Parameters<PushMetricExporter['export']>): void {
    const oTelAddress = this.collectorUrl
    const callback = (result: ExportResult): void => {
      void eventBus.emit(
        result.code === ExportResultCode.SUCCESS
          ? events.telemetry.sendOk
          : events.telemetry.sendFailed,
        {
          ...hubService.getServiceMetadata(),
          oTelAddress
        }
      )
      originalCallback(result)
    }

    this.exporter.export(metrics, callback, ...restArgs)
  }

  async forceFlush (...args: Parameters<PushMetricExporter['forceFlush']>): Promise<void> {
    return this.exporter.forceFlush(...args)
  }

  selectAggregationTemporality (...args: Parameters<NonNullable<PushMetricExporter['selectAggregationTemporality']>>): AggregationTemporality {
    return this.exporter.selectAggregationTemporality(...args)
  }

  async shutdown (): Promise<void> {
    return this.exporter.shutdown()
  }
}
