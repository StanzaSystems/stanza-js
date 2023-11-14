import {
  ROOT_CONTEXT,
  type TextMapGetter,
  type TextMapSetter,
} from '@opentelemetry/api';
import { describe, expect, it } from 'vitest';
import * as oTelApi from '@opentelemetry/api';
import { HeaderContextPropagator } from './HeaderContextPropagator';

describe('StanzaApiKeyPropagator', function () {
  const headerKey = 'x-stanza-key';
  const contextKey = oTelApi.createContextKey('A Context Key');
  const propagator = new HeaderContextPropagator(headerKey, contextKey);

  const recordGetter: TextMapGetter<Record<string, string>> = {
    get: (carrier, key) => carrier[key],
    keys: (carrier) => Object.keys(carrier),
  };

  const recordSetter: TextMapSetter<Record<string, string>> = {
    set: (carrier, key, value) => {
      carrier[key] = value;
    },
  };

  describe('extract', function () {
    it('should extract Stanza key from carrier', function () {
      expect(
        propagator
          .extract(
            ROOT_CONTEXT,
            {
              [headerKey]: 'aToken',
            },
            recordGetter,
          )
          .getValue(contextKey),
      ).toEqual('aToken');
    });

    it('should extract the first Stanza key from carrier if returns multiple keys', function () {
      expect(
        propagator
          .extract(
            ROOT_CONTEXT,
            {},
            {
              get: () => ['aToken'],
              keys: () => [],
            },
          )
          .getValue(contextKey),
      ).toEqual('aToken');
    });

    it('should NOT extract the Stanza key from carrier if returns an empty array', function () {
      expect(
        propagator
          .extract(
            ROOT_CONTEXT,
            {},
            {
              get: () => [],
              keys: () => [],
            },
          )
          .getValue(contextKey),
      ).toBeUndefined();
    });

    it('should NOT extract Stanza key from carrier if does not exist', function () {
      expect(
        propagator.extract(ROOT_CONTEXT, {}, recordGetter).getValue(contextKey),
      ).toBeUndefined();
    });
  });

  describe('inject', function () {
    it('should inject Stanza key into the carrier', function () {
      const initialContext = ROOT_CONTEXT.setValue(contextKey, 'aToken');
      const carrier: Record<string, string> = {};

      propagator.inject(initialContext, carrier, recordSetter);

      expect(carrier[headerKey]).toEqual('aToken');
    });

    it('should NOT inject Stanza key into the carrier if does not exist', function () {
      const carrier: Record<string, string> = {};

      propagator.inject(ROOT_CONTEXT, carrier, recordSetter);

      expect(carrier[headerKey]).toBeUndefined();
    });
  });

  describe('fields', function () {
    it('should return x-stanza-key in fields', function () {
      expect(propagator.fields()).toEqual(['x-stanza-key']);
    });
  });
});
