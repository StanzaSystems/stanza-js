import { Metadata } from '@grpc/grpc-js'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { AggregationTemporality, InMemoryMetricExporter, type PushMetricExporter } from '@opentelemetry/sdk-metrics'
import { addServiceConfigListener, getServiceConfig } from '../../global/serviceConfig'
import { type ServiceConfig } from '../../hub/model'

export class StanzaMetricExporter implements PushMetricExporter {
  private exporter: InMemoryMetricExporter | OTLPMetricExporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE)

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
    prevExporter.shutdown().catch(err => {
      console.log('Failed to shutdown a metric exporter:\n', err)
    })
  }

  export (...args: Parameters<PushMetricExporter['export']>): void {
    this.exporter.export(...args)
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
