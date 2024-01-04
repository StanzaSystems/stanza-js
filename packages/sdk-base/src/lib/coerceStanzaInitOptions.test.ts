import { describe, expect, it } from 'vitest';
import {
  coerceStringToBoolean,
  coerceStringToInteger,
} from './coerceStanzaInitOptions';

describe('coerceStanzaInitOptions', () => {
  describe('coerceStringToNumber', () => {
    it('should coerce valid string to number', () => {
      expect(coerceStringToInteger('100')).toBe(100);
    });

    it('should NOT coerce string representing float to number', () => {
      expect(coerceStringToInteger('100.234')).toBeUndefined();
    });

    it('should NOT coerce empty string to number', () => {
      expect(coerceStringToInteger('')).toBeUndefined();
    });

    it('should NOT coerce undefined to number', () => {
      expect(coerceStringToInteger(undefined)).toBeUndefined();
    });

    it('should NOT coerce invalid strings to number', () => {
      expect(coerceStringToInteger('qwerty')).toBeUndefined();
      expect(coerceStringToInteger('NaN')).toBeUndefined();
    });
  });

  describe('coerceStringToBoolean', () => {
    it('should coerce valid strings', () => {
      expect(coerceStringToBoolean('true')).toBe(true);
      expect(coerceStringToBoolean('false')).toBe(false);
    });

    it('should NOT coerce empty string', () => {
      expect(coerceStringToBoolean('')).toBeUndefined();
    });

    it('should NOT coerce undefined', () => {
      expect(coerceStringToBoolean(undefined)).toBeUndefined();
    });

    it('should NOT coerce invalid strings', () => {
      expect(coerceStringToBoolean('qwerty')).toBeUndefined();
      expect(coerceStringToBoolean('NaN')).toBeUndefined();
    });
  });
});
