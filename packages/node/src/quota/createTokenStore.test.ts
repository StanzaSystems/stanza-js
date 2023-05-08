import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenStore } from './createTokenStore'
import { type TokenStore } from './tokenStore'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { type StanzaTokenLeases } from '../hub/model'

describe('tokenStore', function () {
  beforeEach(() => {
    mockHubService.reset()
    vi.useFakeTimers({
      now: 0
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create token store', function () {
    expect(createTokenStore).not.toThrow()
  })

  describe('getToken', function () {
    let tokenStore: TokenStore

    beforeEach(() => {
      tokenStore = createTokenStore()
    })

    it('should fetch tokens initially', async function () {
      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()
    })

    it('should return token returned from getTokenLeases', async function () {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases([{
        token: 'testToken',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await expect(getTokenFromStorePromise).resolves.toEqual('testToken')
    })

    it('should return token second token without calling hub again', async function () {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases([{
        token: 'testToken1',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken2',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await vi.advanceTimersByTimeAsync(0)

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      await expect(getSecondTokenFromStorePromise).resolves.toEqual('testToken2')
    })

    it('should fetch new token leases if current state does not contain token for a given query', async function () {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases([{
        token: 'testToken1',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken2',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await vi.advanceTimersByTimeAsync(0)

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator',
        feature: 'anotherFeature'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveTokenLeases([{
        token: 'testToken3',
        feature: 'anotherFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken4',
        feature: 'anotherFeature',
        expiresAt: 300,
        priorityBoost: 4
      }])

      await expect(getSecondTokenFromStorePromise).resolves.toEqual('testToken3')
    })

    it('should call getTokenLeases only once if waiting for multiple tokens', async function () {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases([{
        token: 'testToken1',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken2',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual('testToken1')
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual('testToken2')
    })
  })
})
