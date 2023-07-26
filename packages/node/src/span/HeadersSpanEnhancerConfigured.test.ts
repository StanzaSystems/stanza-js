import { describe, expect, it, vi } from 'vitest'
import { HeadersSpanEnhancerConfigured } from './HeadersSpanEnhancerConfigured'
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api'
import { Span, Tracer } from '@opentelemetry/sdk-trace-node'
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base/build/src/BasicTracerProvider'

const getHeader = (headers: Record<string, string | number | string[] | undefined>) => (headerName: string) => headers[headerName]

const createTestSpan = () => {
  const tracer = new Tracer({ name: 'test instrumentation' }, {}, new BasicTracerProvider())
  const span = new Span(tracer, ROOT_CONTEXT, 'test span', { traceId: 'testTraceId', spanId: 'testSpanId', traceFlags: TraceFlags.SAMPLED }, SpanKind.INTERNAL)
  const setAttributeSpy = vi.spyOn(span, 'setAttribute')
  return {
    span,
    setAttributeSpy
  }
}

describe('HeadersSpanEnhancerConfigured', () => {
  describe('with empty config', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([])

    it('should attach empty headers to context if carries has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan()

      enhancer.enhanceWithRequest(span, getHeader({}))
      expect(setAttributeSpy).not.toHaveBeenCalled()
    })

    it('should attach empty headers to context if carries has headers', () => {
      const { span, setAttributeSpy } = createTestSpan()

      enhancer.enhanceWithRequest(span, getHeader({ testHeader: 'testHeaderValue' }))
      expect(setAttributeSpy).not.toHaveBeenCalled()
    })
  })

  describe('with non empty config and distinct headers', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([{
      requestHeaderName: ['first-header-request'],
      responseHeaderName: ['first-header-response'],
      spanSelectors: []
    }])

    it('should attach empty headers to context if carries has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan()

      enhancer.enhanceWithRequest(span, getHeader({ }))
      expect(setAttributeSpy).not.toHaveBeenCalled()
    })

    it('should attach headers to context if carries has request headers', () => {
      const { span, setAttributeSpy } = createTestSpan()

      enhancer.enhanceWithRequest(span, getHeader({
        testHeader: 'testHeaderValue',
        'first-header-request': 'first-header-request-value'
      }))
      expect(setAttributeSpy).toHaveBeenCalledOnce()
      expect(setAttributeSpy).toHaveBeenCalledWith('http.request.header.first_header_request', ['first-header-request-value'])
    })

    it('should attach headers to context if carries has response headers', () => {
      const { span, setAttributeSpy } = createTestSpan()

      enhancer.enhanceWithResponse(span, getHeader({
        testHeader: 'testHeaderValue',
        'first-header-response': 'first-header-response-value'
      }))
      expect(setAttributeSpy).toHaveBeenCalledOnce()
      expect(setAttributeSpy).toHaveBeenCalledWith('http.response.header.first_header_response', ['first-header-response-value'])
    })
  })

  // TODO
  // describe('with non empty config and non distinct headers', () => {
  //   const propagator = new HeadersSpanEnhancerConfigured([{
  //     requestHeaderName: ['first-header-request', 'common-header'],
  //     responseHeaderName: ['first-header-response', 'common-header'],
  //     spanSelectors: []
  //   }])
  //
  //   it('should return distinct fields', () => {
  //     expect(propagator.fields()).toEqual(['first-header-request', 'common-header', 'first-header-response'])
  //   })
  //
  //   it('should attach empty headers to context if carries has no headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
  //   })
  //
  //   it('should attach headers to context if carries has request headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {
  //       testHeader: 'testHeaderValue',
  //       'first-header-request': 'first-header-request-value',
  //       'common-header': 'common-header-request-value'
  //     }, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
  //       key: 'first-header-request',
  //       value: 'first-header-request-value'
  //     }, {
  //       key: 'common-header',
  //       value: 'common-header-request-value'
  //     }])
  //   })
  //
  //   it('should attach headers to context if carries has response headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {
  //       testHeader: 'testHeaderValue',
  //       'first-header-response': 'first-header-response-value',
  //       'common-header': 'common-header-response-value'
  //     }, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
  //       key: 'common-header',
  //       value: 'common-header-response-value'
  //     }, {
  //       key: 'first-header-response',
  //       value: 'first-header-response-value'
  //     }])
  //   })
  // })
  //
  // describe('with multiple non empty configs', () => {
  //   const propagator = new HeadersSpanEnhancerConfigured([{
  //     requestHeaderName: ['first-header-request', 'common-header'],
  //     responseHeaderName: ['first-header-response', 'common-header'],
  //     spanSelectors: []
  //   }, {
  //     requestHeaderName: ['second-header-request', 'common-header'],
  //     responseHeaderName: ['second-header-response', 'common-header'],
  //     spanSelectors: []
  //   }])
  //
  //   it('should return distinct fields', () => {
  //     expect(propagator.fields()).toEqual(['first-header-request', 'common-header', 'first-header-response', 'second-header-request', 'second-header-response'])
  //   })
  //
  //   it('should attach empty headers to context if carries has no headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {}, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([])
  //   })
  //
  //   it('should attach headers to context if carries has request headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {
  //       testHeader: 'testHeaderValue',
  //       'first-header-request': 'first-header-request-value',
  //       'second-header-request': 'second-header-request-value',
  //       'common-header': 'common-header-request-value'
  //     }, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
  //       key: 'first-header-request',
  //       value: 'first-header-request-value'
  //     }, {
  //       key: 'common-header',
  //       value: 'common-header-request-value'
  //     }, {
  //       key: 'second-header-request',
  //       value: 'second-header-request-value'
  //     }])
  //   })
  //
  //   it('should attach headers to context if carries has response headers', () => {
  //     const propagatedContext = propagator.extract(ROOT_CONTEXT, {
  //       testHeader: 'testHeaderValue',
  //       'first-header-response': 'first-header-response-value',
  //       'second-header-response': 'second-header-response-value',
  //       'common-header': 'common-header-response-value'
  //     }, recordGetter)
  //     expect(propagatedContext.getValue(stanzaHeadersToSpanContextKey)).toEqual([{
  //       key: 'common-header',
  //       value: 'common-header-response-value'
  //     }, {
  //       key: 'first-header-response',
  //       value: 'first-header-response-value'
  //     }, {
  //       key: 'second-header-response',
  //       value: 'second-header-response-value'
  //     }])
  //   })
  // })
})
