import { type Context } from '@opentelemetry/api'
import { type SpanProcessor } from '@opentelemetry/sdk-trace-node'

export interface SpanProcessorManager {
  forceFlushAllSpanProcessors: () => Promise<void>
  shutdownAllSpanProcessors: () => Promise<void>
  getSpanProcessor: (context: Context) => SpanProcessor
}
