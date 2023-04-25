import { Metadata } from '@grpc/grpc-js'
import { type Context } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { BatchSpanProcessor, NoopSpanProcessor, type ReadableSpan, type Span, type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { addServiceConfigListener } from '../global/serviceConfig'

export class StanzaSpanProcessor implements SpanProcessor {
  private serviceProcessor: SpanProcessor = new NoopSpanProcessor()
  private readonly unsubscribeServiceConfigListener = addServiceConfigListener(({ config: { traceConfig } }) => {
    const metadata = new Metadata()
    metadata.set('x-stanza-key', traceConfig.collectorKey)

    const exporter = new OTLPTraceExporter({
      url: traceConfig.collectorUrl,
      metadata
    })
    void this.serviceProcessor.shutdown()
    this.serviceProcessor = new BatchSpanProcessor(exporter)
  })

  async forceFlush (): Promise<void> {
    return this.serviceProcessor.forceFlush()
  }

  onEnd (span: ReadableSpan): void {
    this.serviceProcessor.onEnd(span)
  }

  onStart (span: Span, parentContext: Context): void {
    this.serviceProcessor.onStart(span, parentContext)
  }

  async shutdown (): Promise<void> {
    this.unsubscribeServiceConfigListener()
    return this.serviceProcessor.shutdown()
  }
}
