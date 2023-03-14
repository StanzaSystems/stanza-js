import { type FeatureState } from '@getstanza/core'
import { describe, expect, it } from 'vitest'
import { createContext, createFeatureFromFeatureState, createFeaturesFromFeatureState, equals, type StanzaContext } from './context'
import { ActionCode, type StanzaFeature } from './feature'

describe('context', () => {
  describe('createFeaturesFromFeatureState', () => {
    it('should create empty features', () => {
      expect(createFeaturesFromFeatureState([], 100)).toEqual([])
    })

    it('should create non empty features', () => {
      expect(createFeaturesFromFeatureState([{
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }, {
        featureName: 'anotherFeature',
        enabledPercent: 100,
        lastRefreshTime: 456
      }], 100)).toEqual([{
        name: 'aFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 123
      }, {
        name: 'anotherFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 456
      }] satisfies StanzaFeature[])
    })

    it('should create non empty features - filter invalid features', () => {
      expect(createFeaturesFromFeatureState([{
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }, {
        featureName: 'anotherFeature',
        enabledPercent: 100,
        lastRefreshTime: 456
      }, {
        featureName: 'invalidFeature',
        enabledPercent: 90,
        lastRefreshTime: 345
      }], 90)).toEqual([{
        name: 'aFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 123
      }, {
        name: 'anotherFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 456
      }] satisfies StanzaFeature[])
    })
  })

  describe('createFeatureFromFeatureState', () => {
    it('should create an enabled feature', () => {
      expect(createFeatureFromFeatureState({
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }, 100)).toEqual({
        name: 'aFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 123
      } satisfies StanzaFeature)
    })

    it('should create an enabled feature if enabledPercent is larger than enablementNumber', () => {
      expect(createFeatureFromFeatureState({
        featureName: 'aFeature',
        enabledPercent: 90,
        lastRefreshTime: 123,
        actionCodeEnabled: ActionCode.ENABLED,
        messageEnabled: 'messageEnabled'
      }, 80)).toEqual({
        name: 'aFeature',
        code: ActionCode.ENABLED,
        lastRefreshTime: 123,
        message: 'messageEnabled'
      } satisfies StanzaFeature)
    })

    it('should create a disabled feature if enabledPercent is lower than enablementNumber', () => {
      expect(createFeatureFromFeatureState({
        featureName: 'aFeature',
        enabledPercent: 80,
        lastRefreshTime: 123,
        actionCodeDisabled: ActionCode.MESSAGE_AND_SEND,
        messageDisabled: 'messageDisabled'
      }, 90)).toEqual({
        name: 'aFeature',
        code: ActionCode.MESSAGE_AND_SEND,
        lastRefreshTime: 123,
        message: 'messageDisabled'
      } satisfies StanzaFeature)
    })

    it('should return undefined if enabledPercent is larger than enablementNumber and no actionCodeEnabled is defined', () => {
      expect(createFeatureFromFeatureState({
        featureName: 'aFeature',
        enabledPercent: 90,
        lastRefreshTime: 123,
        messageEnabled: 'messageEnabled'
      }, 80)).toEqual(undefined)
    })

    it('should return undefined if enabledPercent is lower than enablementNumber and no actionCodeDisabled is defined', () => {
      expect(createFeatureFromFeatureState({
        featureName: 'aFeature',
        enabledPercent: 80,
        lastRefreshTime: 123,
        messageDisabled: 'messageDisabled'
      }, 90)).toEqual(undefined)
    })
  })

  describe('createContext', () => {
    it('should create context with no features - not ready', () => {
      expect(createContext('aContext', [], 100)).toEqual({
        name: 'aContext',
        features: {},
        featuresNames: [],
        ready: false
      } satisfies StanzaContext)
    })

    it('should create context with no features - ready', () => {
      expect(createContext('aContext', [], 100, true)).toEqual({
        name: 'aContext',
        features: {},
        featuresNames: [],
        ready: true
      } satisfies StanzaContext)
    })

    it('should create context with one feature', () => {
      expect(createContext('aContext', [{
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }], 100)).toEqual({
        name: 'aContext',
        features: {
          aFeature: {
            name: 'aFeature',
            code: ActionCode.ENABLED,
            lastRefreshTime: 123
          }
        },
        featuresNames: ['aFeature'],
        ready: false
      } satisfies StanzaContext)
    })

    it('should create context with two different features', () => {
      expect(createContext('aContext', [{
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }, {
        featureName: 'anotherFeature',
        enabledPercent: 100,
        lastRefreshTime: 456
      }], 100)).toEqual({
        name: 'aContext',
        features: {
          aFeature: {
            name: 'aFeature',
            code: ActionCode.ENABLED,
            lastRefreshTime: 123
          },
          anotherFeature: {
            name: 'anotherFeature',
            code: ActionCode.ENABLED,
            lastRefreshTime: 456
          }
        },
        featuresNames: ['aFeature', 'anotherFeature'],
        ready: false
      } satisfies StanzaContext)
    })

    it('should create context with two duplicate features', () => {
      expect(createContext('aContext', [{
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }, {
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 456
      }], 100)).toEqual({
        name: 'aContext',
        features: {
          aFeature: {
            name: 'aFeature',
            code: ActionCode.ENABLED,
            lastRefreshTime: 456
          }
        },
        featuresNames: ['aFeature'],
        ready: false
      } satisfies StanzaContext)
    })
  })

  describe('equals', () => {
    it('should equal for same empty contexts', () => {
      const context1: StanzaContext = createContext('aContext', [], 100, true)
      const context2: StanzaContext = createContext('aContext', [], 100, true)

      expect(equals(context1, context2)).toBe(true)
    })

    it('should equal for same non empty contexts', () => {
      const aFeature: FeatureState = {
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const context1: StanzaContext = createContext('aContext', [aFeature], 100, true)
      const context2: StanzaContext = createContext('aContext', [aFeature], 100, true)

      expect(equals(context1, context2)).toBe(true)
    })

    it('should not equal for contexts with different names', () => {
      const aFeature: FeatureState = {
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const context1: StanzaContext = createContext('aContext1', [aFeature], 100, true)
      const context2: StanzaContext = createContext('aContext2', [aFeature], 100, true)

      expect(equals(context1, context2)).toBe(false)
    })

    it('should not equal for contexts with feature lengths', () => {
      const aFeature: FeatureState = {
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const anotherFeature: FeatureState = {
        featureName: 'anotherFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const context1: StanzaContext = createContext('aContext', [aFeature], 100, true)
      const context2: StanzaContext = createContext('aContext', [aFeature, anotherFeature], 100, true)

      expect(equals(context1, context2)).toBe(false)
    })

    it('should not equal for contexts with different features', () => {
      const aFeature: FeatureState = {
        featureName: 'aFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const anotherFeature: FeatureState = {
        featureName: 'anotherFeature',
        enabledPercent: 100,
        lastRefreshTime: 123
      }
      const context1: StanzaContext = createContext('aContext', [aFeature], 100, true)
      const context2: StanzaContext = createContext('aContext', [anotherFeature], 100, true)

      expect(equals(context1, context2)).toBe(false)
    })
  })
})
