import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'

describe('createTokenState', function () {
  beforeEach(() => {
    vi.useFakeTimers({
      now: 0
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create token state', function () {
    expect(createTokenState).not.toThrow()
  })

  it('should addTokens without throwing', function () {
    const tokenState = createTokenState()

    expect(() => {
      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])
    }).not.toThrow()
  })

  describe('hasToken', function () {
    it('should not have token initially', function () {
      const tokenState = createTokenState()

      expect(tokenState.hasToken()).toBe(false)
    })

    it('should have token if it was added and no query is provided', function () {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.hasToken()).toBe(true)
    })

    it.each([
      { feature: 'testFeature' },
      { priorityBoost: 0 },
      { priorityBoost: -2 },
      { feature: 'testFeature', priorityBoost: 0 },
      { feature: 'testFeature', priorityBoost: -2 }
    ] satisfies TokenQuery[])('should have token if it was added and matching query is provided - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.hasToken(query)).toBe(true)
    })

    it.each([
      { feature: 'anotherFeature' },
      { priorityBoost: 2 },
      { feature: 'anotherFeature', priorityBoost: 2 },
      { feature: 'testFeature', priorityBoost: 2 },
      { feature: 'anotherFeature', priorityBoost: 0 }
    ] satisfies TokenQuery[])('should NOT have token that does not match query - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.hasToken(query)).toBe(false)
    })

    it.each([
      { feature: 'testFeature' },
      { priorityBoost: 0 },
      { priorityBoost: -2 },
      { feature: 'testFeature', priorityBoost: 0 },
      { feature: 'testFeature', priorityBoost: -2 }
    ] satisfies TokenQuery[])('should NOT have token if it was added and matching query is provided but it is expired - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      vi.setSystemTime(300)

      expect(tokenState.hasToken(query)).toBe(false)
    })
  })

  describe('popToken', function () {
    it('should not have token initially', function () {
      const tokenState = createTokenState()

      expect(tokenState.popToken()).toBe(null)
    })

    it('should return token if it was added and no query is provided', function () {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.popToken()).toEqual({
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      })
    })

    it.each([
      { feature: 'testFeature' },
      { priorityBoost: 0 },
      { priorityBoost: -2 },
      { feature: 'testFeature', priorityBoost: 0 },
      { feature: 'testFeature', priorityBoost: -2 }
    ] satisfies TokenQuery[])('should return token if it was added and matching query is provided - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.popToken(query)).toEqual({
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      })
    })

    it('should return token more than once if it was added and no query is provided', function () {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }, {
        token: 'testToken 2',
        feature: 'anotherFeature',
        priorityBoost: 0,
        expiresAt: 200
      }, {
        token: 'testToken 3',
        feature: 'testFeature',
        priorityBoost: 3,
        expiresAt: 200
      }])

      expect(tokenState.popToken()).toEqual({
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      })

      expect(tokenState.popToken()).toEqual({
        token: 'testToken 2',
        feature: 'anotherFeature',
        priorityBoost: 0,
        expiresAt: 200
      })

      expect(tokenState.popToken()).toEqual({
        token: 'testToken 3',
        feature: 'testFeature',
        priorityBoost: 3,
        expiresAt: 200
      })

      expect(tokenState.popToken()).toBe(null)
    })

    it.each([
      { feature: 'testFeature' },
      { feature: 'testFeature', priorityBoost: 0 },
      { feature: 'testFeature', priorityBoost: -2 }
    ] satisfies TokenQuery[])('should return token more than once if it was added and matching query is provided - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }, {
        token: 'testToken 2',
        feature: 'anotherFeature',
        priorityBoost: 0,
        expiresAt: 200
      }, {
        token: 'testToken 3',
        feature: 'testFeature',
        priorityBoost: 3,
        expiresAt: 200
      }])

      expect(tokenState.popToken(query)).toEqual({
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      })

      expect(tokenState.popToken(query)).toEqual({
        token: 'testToken 3',
        feature: 'testFeature',
        priorityBoost: 3,
        expiresAt: 200
      })

      expect(tokenState.popToken(query)).toBe(null)
    })

    it.each([
      { feature: 'anotherFeature' },
      { priorityBoost: 2 },
      { feature: 'anotherFeature', priorityBoost: 2 },
      { feature: 'testFeature', priorityBoost: 2 },
      { feature: 'anotherFeature', priorityBoost: 0 }
    ] satisfies TokenQuery[])('should return null if no toke does not match query - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      expect(tokenState.popToken(query)).toBe(null)
    })

    it.each([
      { feature: 'testFeature' },
      { priorityBoost: 0 },
      { priorityBoost: -2 },
      { feature: 'testFeature', priorityBoost: 0 },
      { feature: 'testFeature', priorityBoost: -2 }
    ] satisfies TokenQuery[])('should return null if it was added and matching query is provided but it is expired - %o', function (query) {
      const tokenState = createTokenState()

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 200
      }])

      vi.setSystemTime(300)

      expect(tokenState.popToken(query)).toBe(null)
    })
  })

  describe('onTokensAvailableRatioChange', function () {
    it('should not call onTokensAvailableRatioChange listener immediately', function () {
      const tokenState = createTokenState()

      const listener = vi.fn()

      tokenState.onTokensAvailableRatioChange(200, listener)

      expect(listener).not.toHaveBeenCalled()
    })

    it('should call onTokensAvailableRatioChange listener when tokens are added', async function () {
      const tokenState = createTokenState()

      const listener = vi.fn()

      tokenState.onTokensAvailableRatioChange(200, listener)

      tokenState.addTokens([{
        token: 'testToken',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }])

      expect(listener).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(0)

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith(1)
    })

    it('should call onTokensAvailableRatioChange listener when tokens are removed', async function () {
      const tokenState = createTokenState()

      const listener = vi.fn()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }, {
        token: 'testToken 2',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }])

      tokenState.onTokensAvailableRatioChange(200, listener)

      tokenState.popToken()

      expect(listener).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(0)

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith(0.5)
    })

    it('should NOT call onTokensAvailableRatioChange listener when popTokens does not match any token', async function () {
      const tokenState = createTokenState()

      const listener = vi.fn()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }, {
        token: 'testToken 2',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }])

      tokenState.onTokensAvailableRatioChange(200, listener)

      tokenState.popToken({
        feature: 'anotherFeature'
      })

      expect(listener).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(0)

      expect(listener).not.toHaveBeenCalled()
    })

    it('should call onTokensAvailableRatioChange listener when token expires', async function () {
      const tokenState = createTokenState()

      const listener = vi.fn()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 500
      }, {
        token: 'testToken 2',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 1000
      }])

      await vi.advanceTimersByTimeAsync(0)

      tokenState.onTokensAvailableRatioChange(200, listener)

      expect(listener).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(300)

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith(0.5)

      listener.mockClear()

      await vi.advanceTimersByTimeAsync(500)

      expect(listener).toHaveBeenCalledOnce()
      expect(listener).toHaveBeenCalledWith(0)
    })

    it('should call appropriate onTokensAvailableRatioChange listener when token expires', async function () {
      const tokenState = createTokenState()

      const listener1 = vi.fn()
      const listener2 = vi.fn()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 600
      }, {
        token: 'testToken 2',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 800
      }])

      await vi.advanceTimersByTimeAsync(0)

      tokenState.onTokensAvailableRatioChange(300, listener1)

      tokenState.onTokensAvailableRatioChange(200, listener2)

      expect(listener1).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(300)

      // time: 300, "testToken 1" expires in 300, "testToken 2" expires in 500, call listener 1
      expect(listener1).toHaveBeenCalledOnce()
      expect(listener1).toHaveBeenCalledWith(0.5)
      expect(listener2).not.toHaveBeenCalled()

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 400, "testToken 1" expires in 200, "testToken 2" expires in 400, call listener 2
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledWith(0.5)

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 500, "testToken 1" expires in 100, "testToken 2" expires in 300, call listener 1
      expect(listener1).toHaveBeenCalledOnce()
      expect(listener1).toHaveBeenCalledWith(0)
      expect(listener2).not.toHaveBeenCalled()

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 600, "testToken 1" expired, "testToken 2" expires in 200, call listener 2
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledWith(0)
    })

    it('should call appropriate onTokensAvailableRatioChange multiple listeners when tokens expire', async function () {
      const tokenState = createTokenState()

      const listener1 = vi.fn()
      const listener2 = vi.fn()

      tokenState.addTokens([{
        token: 'testToken 1',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 600
      }, {
        token: 'testToken 2',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 700
      }, {
        token: 'testToken 3',
        feature: 'testFeature',
        priorityBoost: 0,
        expiresAt: 800
      }])

      await vi.advanceTimersByTimeAsync(0)

      tokenState.onTokensAvailableRatioChange(300, listener1)

      tokenState.onTokensAvailableRatioChange(200, listener2)

      expect(listener1).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(300)

      // time: 300, "testToken 1" expires in 300, "testToken 2" expires in 400,, "testToken 3" expires in 500, call listener 1
      expect(listener1).toHaveBeenCalledOnce()
      expect(listener1).toHaveBeenCalledWith(2 / 3)
      expect(listener2).not.toHaveBeenCalled()

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 400, "testToken 1" expires in 200, "testToken 2" expires in 300,, "testToken 3" expires in 400, call listener 1 & listener 2
      expect(listener1).toHaveBeenCalledOnce()
      expect(listener1).toHaveBeenCalledWith(1 / 3)
      expect(listener2).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledWith(2 / 3)

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 500, "testToken 1" expires in 100, "testToken 2" expires in 200,, "testToken 3" expires in 300, call listener 1 & listener 2
      expect(listener1).toHaveBeenCalledOnce()
      expect(listener1).toHaveBeenCalledWith(0)
      expect(listener2).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledWith(1 / 3)

      listener1.mockClear()
      listener2.mockClear()

      await vi.advanceTimersByTimeAsync(100)

      // time: 600, "testToken 1" expired, "testToken 2" expires in 100,, "testToken 3" expires in 200, call listener 2
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledWith(0)
    })
  })
})
