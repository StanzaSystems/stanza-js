import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { type ASpanEnhancer } from '../../span/ASpanEnhancer'

export class StanzaSpanProcessor extends BatchSpanProcessor {
  constructor (private readonly spanEnhancers: ASpanEnhancer[], ...batchSpanProcessorArgs: ConstructorParameters<typeof BatchSpanProcessor>) {
    super(...batchSpanProcessorArgs)
  }

  override onStart (...args: Parameters<BatchSpanProcessor['onStart']>) {
    // this.spanEnhancers.forEach(enhancer => {
    //   enhancer(...args)
    // })
    super.onStart(...args)
  }
}
