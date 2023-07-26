import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { type SpanEnhancer } from '../../span/SpanEnhancer'

export class StanzaSpanProcessor extends BatchSpanProcessor {
  constructor (private readonly spanEnhancers: SpanEnhancer[], ...batchSpanProcessorArgs: ConstructorParameters<typeof BatchSpanProcessor>) {
    super(...batchSpanProcessorArgs)
  }

  override onStart (...args: Parameters<BatchSpanProcessor['onStart']>) {
    // this.spanEnhancers.forEach(enhancer => {
    //   enhancer(...args)
    // })
    super.onStart(...args)
  }
}
