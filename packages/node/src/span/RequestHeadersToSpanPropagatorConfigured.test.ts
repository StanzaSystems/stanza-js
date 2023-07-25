import { describe, expect, it } from 'vitest'
import { HeadersSpanEnhancerConfigured } from './HeadersSpanEnhancerConfigured'
import { ROOT_CONTEXT, type TextMapGetter } from '@opentelemetry/api'
import { stanzaHeadersToSpanContextKey } from '../context/stanzaHeadersToSpanContextKey'

const recordGetter: TextMapGetter<Record<string, string>> = {
  get: (carrier, key) => carrier[key],
  keys: (carrier) => Object.keys(carrier)
}

describe('RequestHeadersToSpanPropagatorConfigured', () => {
  describe('with empty config', () => {
    const propagator = new HeadersSpanEnhancerConfigured([])
    it('should return empty fields', () => {
      expect(propagator.fields()).toEqual([])
    })

    it('should attach empty headers to context if carries has no headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
    })

    it('should attach empty headers to context if carries has headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, { testHeader: 'testHeaderValue' }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
    })
  })

  describe('with non empty config and distinct headers', () => {
    const propagator = new HeadersSpanEnhancerConfigured([{
      requestHeaderName: ['first-header-request'],
      responseHeaderName: ['first-header-response'],
      spanSelectors: []
    }])

    it('should return fields', () => {
      expect(propagator.fields()).toEqual(['first-header-request', 'first-header-response'])
    })

    it('should attach empty headers to context if carries has no headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
    })

    it('should attach headers to context if carries has request headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-request': 'first-header-request-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'first-header-request',
        value: 'first-header-request-value'
      }])
    })

    it('should attach headers to context if carries has response headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-response': 'first-header-response-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'first-header-response',
        value: 'first-header-response-value'
      }])
    })
  })

  describe('with non empty config and non distinct headers', () => {
    const propagator = new HeadersSpanEnhancerConfigured([{
      requestHeaderName: ['first-header-request', 'common-header'],
      responseHeaderName: ['first-header-response', 'common-header'],
      spanSelectors: []
    }])

    it('should return distinct fields', () => {
      expect(propagator.fields()).toEqual(['first-header-request', 'common-header', 'first-header-response'])
    })

    it('should attach empty headers to context if carries has no headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
    })

    it('should attach headers to context if carries has request headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-request': 'first-header-request-value',
        'common-header': 'common-header-request-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'first-header-request',
        value: 'first-header-request-value'
      }, {
        key: 'common-header',
        value: 'common-header-request-value'
      }])
    })

    it('should attach headers to context if carries has response headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-response': 'first-header-response-value',
        'common-header': 'common-header-response-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'common-header',
        value: 'common-header-response-value'
      }, {
        key: 'first-header-response',
        value: 'first-header-response-value'
      }])
    })
  })

  describe('with multiple non empty configs', () => {
    const propagator = new HeadersSpanEnhancerConfigured([{
      requestHeaderName: ['first-header-request', 'common-header'],
      responseHeaderName: ['first-header-response', 'common-header'],
      spanSelectors: []
    }, {
      requestHeaderName: ['second-header-request', 'common-header'],
      responseHeaderName: ['second-header-response', 'common-header'],
      spanSelectors: []
    }])

    it('should return distinct fields', () => {
      expect(propagator.fields()).toEqual(['first-header-request', 'common-header', 'first-header-response', 'second-header-request', 'second-header-response'])
    })

    it('should attach empty headers to context if carries has no headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
    })

    it('should attach headers to context if carries has request headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-request': 'first-header-request-value',
        'second-header-request': 'second-header-request-value',
        'common-header': 'common-header-request-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'first-header-request',
        value: 'first-header-request-value'
      }, {
        key: 'common-header',
        value: 'common-header-request-value'
      }, {
        key: 'second-header-request',
        value: 'second-header-request-value'
      }])
    })

    it('should attach headers to context if carries has response headers', () => {
      const propagatedContext = propagator.extract(ROOT_CONTEXT, {
        testHeader: 'testHeaderValue',
        'first-header-response': 'first-header-response-value',
        'second-header-response': 'second-header-response-value',
        'common-header': 'common-header-response-value'
      }, recordGetter)
      expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
        key: 'common-header',
        value: 'common-header-response-value'
      }, {
        key: 'first-header-response',
        value: 'first-header-response-value'
      }, {
        key: 'second-header-response',
        value: 'second-header-response-value'
      }])
    })
  })
})
