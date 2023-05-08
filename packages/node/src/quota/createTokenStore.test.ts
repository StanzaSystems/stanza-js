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

    it('should fetch tokens initially', async () => {
      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()
    })

    it('should return token returned from getTokenLeases', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
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

    it('should return token second token without calling hub again', async () => {
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

    it('should fetch new token leases if current state does not contain token for a given query', async () => {
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

    it('should call getTokenLeases only once if waiting for multiple tokens', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
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

    it('should get tokens for 2 different decorators separately', async () => {
      let resolveFirstTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      let resolveSecondTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveFirstTokenLeases = resolve
      }))
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveSecondTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'anotherTestDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveFirstTokenLeases([{
        token: 'testToken1',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      resolveSecondTokenLeases([{
        token: 'testToken2',
        feature: 'anotherTestFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual('testToken1')
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual('testToken2')
    })

    it('should queue get tokens until current get token leases resolves', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeases | null) => void = () => {}
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeases | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromises = Array(7).fill(0)
        .map(async () => tokenStore.getToken({
          decorator: 'testDecorator'
        }))

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases([{
        token: 'testToken0',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      },
      {
        token: 'testToken1',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }
      ])

      await expect(getTokenFromStorePromises[0]).resolves.toEqual('testToken0')
      await expect(getTokenFromStorePromises[1]).resolves.toEqual('testToken1')

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveTokenLeases([{
        token: 'testToken2',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken3',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await expect(getTokenFromStorePromises[2]).resolves.toEqual('testToken2')
      await expect(getTokenFromStorePromises[3]).resolves.toEqual('testToken3')

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(3)

      resolveTokenLeases([{
        token: 'testToken4',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken5',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }, {
        token: 'testToken6',
        feature: 'testFeature',
        expiresAt: 300,
        priorityBoost: 0
      }])

      await expect(getTokenFromStorePromises[4]).resolves.toEqual('testToken4')
      await expect(getTokenFromStorePromises[5]).resolves.toEqual('testToken5')
      await expect(getTokenFromStorePromises[6]).resolves.toEqual('testToken6')
    })
  })
})
