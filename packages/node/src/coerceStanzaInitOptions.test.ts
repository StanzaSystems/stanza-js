import { describe, expect, it } from 'vitest'
import { coerceStringToInteger } from './coerceStanzaInitOptions'

describe('coerceStanzaInitOptions', () => {
  describe('coerceStringToNumber', () => {
    it('should coerce valid string to number', () => {
      expect(coerceStringToInteger('100')).toBe(100)
    })

    it('should NOT coerce string representing float to number', () => {
      expect(coerceStringToInteger('100.234')).toBeUndefined()
    })

    it('should NOT coerce empty string representing to number', () => {
      expect(coerceStringToInteger('')).toBeUndefined()
    })

    it('should NOT coerce undefined representing to number', () => {
      expect(coerceStringToInteger(undefined)).toBeUndefined()
    })

    it('should NOT coerce invalid strings representing to number', () => {
      expect(coerceStringToInteger('qwerty')).toBeUndefined()
      expect(coerceStringToInteger('NaN')).toBeUndefined()
    })
  })
})
