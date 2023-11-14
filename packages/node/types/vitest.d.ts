import { type BaggageEntry } from '@opentelemetry/api'
import { type SyncExpectationResult } from '@vitest/expect'

interface CustomMatchers {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  toHaveBaggage(expected: Record<string, BaggageEntry>): SyncExpectationResult
}

declare global {
  namespace Chai {
    interface Assertion extends CustomMatchers {}

    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}
