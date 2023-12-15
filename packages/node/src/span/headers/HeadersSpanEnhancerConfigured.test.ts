import { describe, expect, it, vi } from 'vitest';
import { HeadersSpanEnhancerConfigured } from './HeadersSpanEnhancerConfigured';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { Span, Tracer } from '@opentelemetry/sdk-trace-base';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base/build/src/BasicTracerProvider';

const getHeader =
  (headers: Record<string, string | number | string[] | undefined>) =>
  (headerName: string) =>
    headers[headerName];

const createTestSpan = () => {
  const tracer = new Tracer(
    { name: 'test instrumentation' },
    {},
    new BasicTracerProvider()
  );
  const span = new Span(
    tracer,
    ROOT_CONTEXT,
    'test span',
    {
      traceId: 'testTraceId',
      spanId: 'testSpanId',
      traceFlags: TraceFlags.SAMPLED,
    },
    SpanKind.INTERNAL
  );
  const setAttributeSpy = vi.spyOn(span, 'setAttribute');
  return {
    span,
    setAttributeSpy,
  };
};

describe('HeadersSpanEnhancerConfigured', () => {
  describe('with empty config', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([]);

    it('should not add span attributes if request has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(span, getHeader({}));
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });

    it('should not add span attributes if request has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(
        span,
        getHeader({ testHeader: 'testHeaderValue' })
      );
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });
  });

  describe('with non empty config and distinct headers', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([
      {
        requestHeaderName: ['first-header-request'],
        responseHeaderName: ['first-header-response'],
        spanSelectors: [],
      },
    ]);

    it('should not add span attributes if request has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(span, getHeader({}));
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });

    it('should add span attributes if request has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-request': 'first-header-request-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledOnce();
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.first_header_request',
        ['first-header-request-value']
      );
    });

    it('should add span attributes if response has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithResponse(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-response': 'first-header-response-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledOnce();
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.first_header_response',
        ['first-header-response-value']
      );
    });
  });

  describe('with non empty config and non distinct headers', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([
      {
        requestHeaderName: ['first-header-request', 'common-header'],
        responseHeaderName: ['first-header-response', 'common-header'],
        spanSelectors: [],
      },
    ]);

    it('should not add span attributes if request has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(span, getHeader({}));
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });

    it('should add span attributes if request has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-request': 'first-header-request-value',
          'common-header': 'common-header-request-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledTimes(2);
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.first_header_request',
        ['first-header-request-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.common_header',
        ['common-header-request-value']
      );
    });

    it('should add span attributes if response has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithResponse(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-response': 'first-header-response-value',
          'common-header': 'common-header-response-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledTimes(2);
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.first_header_response',
        ['first-header-response-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.common_header',
        ['common-header-response-value']
      );
    });
  });

  describe('with multiple non empty configs', () => {
    const enhancer = new HeadersSpanEnhancerConfigured([
      {
        requestHeaderName: ['first-header-request', 'common-header'],
        responseHeaderName: ['first-header-response', 'common-header'],
        spanSelectors: [],
      },
      {
        requestHeaderName: ['second-header-request', 'common-header'],
        responseHeaderName: ['second-header-response', 'common-header'],
        spanSelectors: [],
      },
    ]);

    it('should not add span attributes if request has no headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(span, getHeader({}));
      expect(setAttributeSpy).not.toHaveBeenCalled();
    });

    it('should add distinct span attributes if request has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithRequest(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-request': 'first-header-request-value',
          'second-header-request': 'second-header-request-value',
          'common-header': 'common-header-request-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledTimes(3);
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.first_header_request',
        ['first-header-request-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.second_header_request',
        ['second-header-request-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.request.header.common_header',
        ['common-header-request-value']
      );
    });

    it('should add distinct span attributes if response has headers', () => {
      const { span, setAttributeSpy } = createTestSpan();

      enhancer.enhanceWithResponse(
        span,
        getHeader({
          testHeader: 'testHeaderValue',
          'first-header-response': 'first-header-response-value',
          'second-header-response': 'second-header-response-value',
          'common-header': 'common-header-response-value',
        })
      );
      expect(setAttributeSpy).toHaveBeenCalledTimes(3);
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.first_header_response',
        ['first-header-response-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.second_header_response',
        ['second-header-response-value']
      );
      expect(setAttributeSpy).toHaveBeenCalledWith(
        'http.response.header.common_header',
        ['common-header-response-value']
      );
    });
  });
});
