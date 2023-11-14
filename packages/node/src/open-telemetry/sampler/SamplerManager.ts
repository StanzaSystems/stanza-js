import { type Context } from '@opentelemetry/api'
import { type Sampler } from '@opentelemetry/sdk-trace-node'

export interface SamplerManager {
  getSampler: (context: Context) => Sampler
  shutdown: () => Promise<void>
}
