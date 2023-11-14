import { type SpanProcessor } from '@opentelemetry/sdk-trace-node'
import { StanzaSpanProcessorManager } from './StanzaSpanProcessorManager'
import { ManagedSpanProcessor } from './ManagedSpanProcessor'

export class StanzaSpanProcessor
  extends ManagedSpanProcessor
  implements SpanProcessor
{
  constructor(serviceName: string, serviceRelease: string) {
    super(new StanzaSpanProcessorManager(serviceName, serviceRelease))
  }
}
