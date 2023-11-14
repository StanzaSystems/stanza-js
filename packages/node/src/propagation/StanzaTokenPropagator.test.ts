import {
  ROOT_CONTEXT,
  type TextMapGetter,
  type TextMapSetter,
} from '@opentelemetry/api';
import { describe, expect, it } from 'vitest';
import { stanzaTokenContextKey } from '../context/stanzaTokenContextKey';
import { StanzaTokenPropagator } from './StanzaTokenPropagator';

describe('StanzaTokenPropagator', function () {
  const propagator = new StanzaTokenPropagator();

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
              'x-stanza-token': 'aToken',
            },
            recordGetter,
          )
          .getValue(stanzaTokenContextKey),
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
          .getValue(stanzaTokenContextKey),
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
          .getValue(stanzaTokenContextKey),
      ).toBeUndefined();
    });

    it('should NOT extract Stanza key from carrier if does not exist', function () {
      expect(
        propagator
          .extract(ROOT_CONTEXT, {}, recordGetter)
          .getValue(stanzaTokenContextKey),
      ).toBeUndefined();
    });
  });

  describe('inject', function () {
    it('should inject Stanza key into the carrier', function () {
      const initialContext = ROOT_CONTEXT.setValue(
        stanzaTokenContextKey,
        'aToken',
      );
      const carrier: Record<string, string> = {};

      propagator.inject(initialContext, carrier, recordSetter);

      expect(carrier['x-stanza-token']).toEqual('aToken');
    });

    it('should NOT inject Stanza key into the carrier if does not exist', function () {
      const carrier: Record<string, string> = {};

      propagator.inject(ROOT_CONTEXT, carrier, recordSetter);

      expect(carrier['x-stanza-token']).toBeUndefined();
    });
  });

  describe('fields', function () {
    it('should return x-stanza-key in fields', function () {
      expect(propagator.fields()).toEqual(['x-stanza-token']);
    });
  });
});
