import {
  ROOT_CONTEXT,
  type TextMapGetter,
  type TextMapSetter,
} from '@opentelemetry/api';
import { describe, expect, it } from 'vitest';
import { stanzaApiKeyContextKey } from '../context/stanzaApiKeyContextKey';
import { StanzaApiKeyPropagator } from './StanzaApiKeyPropagator';

describe('StanzaApiKeyPropagator', function () {
  const propagator = new StanzaApiKeyPropagator();

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
              'x-stanza-key': 'aToken',
            },
            recordGetter
          )
          .getValue(stanzaApiKeyContextKey)
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
            }
          )
          .getValue(stanzaApiKeyContextKey)
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
            }
          )
          .getValue(stanzaApiKeyContextKey)
      ).toBeUndefined();
    });

    it('should NOT extract Stanza key from carrier if does not exist', function () {
      expect(
        propagator
          .extract(ROOT_CONTEXT, {}, recordGetter)
          .getValue(stanzaApiKeyContextKey)
      ).toBeUndefined();
    });
  });

  describe('inject', function () {
    it('should inject Stanza key into the carrier', function () {
      const initialContext = ROOT_CONTEXT.setValue(
        stanzaApiKeyContextKey,
        'aToken'
      );
      const carrier: Record<string, string> = {};

      propagator.inject(initialContext, carrier, recordSetter);

      expect(carrier['x-stanza-key']).toEqual('aToken');
    });

    it('should NOT inject Stanza key into the carrier if does not exist', function () {
      const carrier: Record<string, string> = {};

      propagator.inject(ROOT_CONTEXT, carrier, recordSetter);

      expect(carrier['x-stanza-key']).toBeUndefined();
    });
  });

  describe('fields', function () {
    it('should return x-stanza-key in fields', function () {
      expect(propagator.fields()).toEqual(['x-stanza-key']);
    });
  });
});
