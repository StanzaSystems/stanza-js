import {
  type BaggageEntry,
  type Context,
  propagation,
} from '@opentelemetry/api';
import { type SyncExpectationResult } from '@vitest/expect';
import { expect } from 'vitest';

expect.extend({
  toHaveBaggage(
    received: Context,
    expected: Record<string, BaggageEntry>
  ): SyncExpectationResult {
    const { equals, isNot, utils } = this;
    const receivedBaggage = propagation.getBaggage(received);
    const compareBaggageEntries = (
      [a]: [string, BaggageEntry],
      [b]: [string, BaggageEntry]
    ) => a.localeCompare(b);
    const receivedEntries = receivedBaggage
      ?.getAllEntries()
      .sort(compareBaggageEntries);
    const expectedEntries = Object.entries(expected).sort(
      compareBaggageEntries
    );
    return {
      pass: equals(receivedEntries, expectedEntries),
      message: () =>
        `Received context does${
          isNot ? ' not' : ''
        } contain expected baggage.\n${utils.diff(
          expectedEntries,
          receivedEntries
        )}`,
      actual: 'receivedEntries',
      expected: 'expectedEntries',
    };
  },
});
