import { type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ManagedSpanProcessor } from './ManagedSpanProcessor'
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager'

export class StanzaSpanProcessor extends ManagedSpanProcessor implements SpanProcessor {
  constructor () {
    super(new StanzaSpanProcessorManager())
  }
}
