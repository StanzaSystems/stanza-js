import { type BaggageEntry, propagation, ROOT_CONTEXT } from '@opentelemetry/api'
import { describe, expect, it } from 'vitest'
import { enrichContextBaggage } from './StanzaBaggagePropagator'

const EMPTY_CONTEXT = ROOT_CONTEXT

describe('enrichContextBaggage', function () {
  it.each([
    {
      'stz-feat': { value: 'testFeature' }
    },
    {
      'uberctx-stz-feat': { value: 'testFeature' }
    },
    {
      'ot-baggage-stz-feat': { value: 'testFeature' }
    }
  ] as Array<Record<string, BaggageEntry>>)('should enrich context with all additional keys given: %o', function (baggageEntries) {
    const contextWithFeatureBaggage = propagation.setBaggage(EMPTY_CONTEXT, propagation.createBaggage(baggageEntries))

    expect(enrichContextBaggage(contextWithFeatureBaggage)).toHaveBaggage({
      'stz-feat': { value: 'testFeature' },
      'uberctx-stz-feat': { value: 'testFeature' },
      'ot-baggage-stz-feat': { value: 'testFeature' }
    })
  })

  it.each([
    {
      'stz-feat': { value: 'testFeature' },
      'uberctx-stz-feat': { value: 'uberCtxTestFeature' },
      'ot-baggage-stz-feat': { value: 'otBaggageTestFeature' }
    },
    {
      'uberctx-stz-feat': { value: 'testFeature' },
      'ot-baggage-stz-feat': { value: 'otBaggageTestFeature' }
    },
    {
      'ot-baggage-stz-feat': { value: 'testFeature' }
    }
  ] as Array<Record<string, BaggageEntry>>)('should enrich context with all additional keys preferring keys in order [StanzaKey, JaegerKeys, DatadogKeys] and given: %o', function (baggageEntries) {
    const contextWithFeatureBaggage = propagation.setBaggage(EMPTY_CONTEXT, propagation.createBaggage(baggageEntries))

    expect(enrichContextBaggage(contextWithFeatureBaggage)).toHaveBaggage({
      'stz-feat': { value: 'testFeature' },
      'uberctx-stz-feat': { value: 'testFeature' },
      'ot-baggage-stz-feat': { value: 'testFeature' }
    })
  })

  it('should not enrich an empty context', function () {
    expect(enrichContextBaggage(EMPTY_CONTEXT)).toEqual(EMPTY_CONTEXT)
  })

  it('should not enrich a context without Stanza specific baggage', function () {
    const contextWithNonStanzaBaggage = propagation.setBaggage(EMPTY_CONTEXT, propagation.createBaggage({
      'another-baggage': { value: 'test value' }
    }))
    expect(enrichContextBaggage(contextWithNonStanzaBaggage)).toHaveBaggage({
      'another-baggage': { value: 'test value' }
    })
  })
})
