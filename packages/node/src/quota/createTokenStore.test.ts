import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenStore } from './createTokenStore'
import { type TokenStore } from './tokenStore'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { type StanzaTokenLeasesResult } from '../hub/model'

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
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      await expect(getTokenFromStorePromise).resolves.toEqual({ granted: true, token: 'testToken' })
    })

    it('should return token second token without calling hub again', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken1',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }, {
          token: 'testToken2',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      await vi.advanceTimersByTimeAsync(0)

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      await expect(getSecondTokenFromStorePromise).resolves.toEqual({ granted: true, token: 'testToken2' })
    })

    it('should fetch new token leases if current state does not contain token for a given query', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      void tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken1',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }, {
          token: 'testToken2',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      await vi.advanceTimersByTimeAsync(0)

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        decorator: 'testDecorator',
        feature: 'anotherFeature'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken3',
          feature: 'anotherFeature',
          expiresAt: 300,
          priorityBoost: 0
        }, {
          token: 'testToken4',
          feature: 'anotherFeature',
          expiresAt: 300,
          priorityBoost: 4
        }]
      })

      await expect(getSecondTokenFromStorePromise).resolves.toEqual({ granted: true, token: 'testToken3' })
    })

    it('should call getTokenLeases only once if waiting for multiple tokens', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken1',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }, {
          token: 'testToken2',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({ granted: true, token: 'testToken1' })
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({ granted: true, token: 'testToken2' })
    })

    it('should get tokens for 2 different decorators separately', async () => {
      let resolveFirstTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      let resolveSecondTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveFirstTokenLeases = resolve
      }))
      mockHubService.getTokenLease.mockImplementationOnce(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveSecondTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'anotherTestDecorator'
      })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveFirstTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken1',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      resolveSecondTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken2',
          feature: 'anotherTestFeature',
          expiresAt: 300,
          priorityBoost: 0
        }]
      })

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({ granted: true, token: 'testToken1' })
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({ granted: true, token: 'testToken2' })
    })

    it('should queue get tokens until current get token leases resolves', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromises = Array(7).fill(0)
        .map(async () => tokenStore.getToken({
          decorator: 'testDecorator'
        }))

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce()

      resolveTokenLeases({
        granted: true,
        leases: [{
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
        }]
      })

      await expect(getTokenFromStorePromises[0]).resolves.toEqual({ granted: true, token: 'testToken0' })
      await expect(getTokenFromStorePromises[1]).resolves.toEqual({ granted: true, token: 'testToken1' })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2)

      resolveTokenLeases(
        {
          granted: true,
          leases: [{
            token: 'testToken2',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0
          }, {
            token: 'testToken3',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0
          }]
        })

      await expect(getTokenFromStorePromises[2]).resolves.toEqual({ granted: true, token: 'testToken2' })
      await expect(getTokenFromStorePromises[3]).resolves.toEqual({ granted: true, token: 'testToken3' })

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(3)

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken4',
          feature: 'testFeature',
          expiresAt: 300,
          priorityBoost: 0
        },
        {
          token: 'testToken5',
          feature:
              'testFeature',
          expiresAt:
              300,
          priorityBoost:
              0
        },
        {
          token: 'testToken6',
          feature:
              'testFeature',
          expiresAt:
              300,
          priorityBoost:
              0
        }
        ]
      })

      await expect(getTokenFromStorePromises[4]).resolves.toEqual({ granted: true, token: 'testToken4' })
      await expect(getTokenFromStorePromises[5]).resolves.toEqual({ granted: true, token: 'testToken5' })
      await expect(getTokenFromStorePromises[6]).resolves.toEqual({ granted: true, token: 'testToken6' })
    })

    it('should fail the getToken if token batch is not granted', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      resolveTokenLeases({
        granted: false
      })

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: false
      })
    })

    it('should fail all current getToken if token batch is not granted', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      resolveTokenLeases({
        granted: false
      })

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: false
      })

      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({
        granted: false
      })
    })

    it('should fetch tokens again after one getToken rejection', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      resolveTokenLeases({
        granted: false
      })

      await getTokenFromStorePromiseFirst
      await getTokenFromStorePromiseSecond

      const getTokenFromStorePromiseThird = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      resolveTokenLeases({
        granted: true,
        leases: [{
          token: 'testToken',
          feature: 'testFeature',
          priorityBoost: 0,
          expiresAt: 500
        }]
      })

      await expect(getTokenFromStorePromiseThird).resolves.toEqual({
        granted: true,
        token: 'testToken'
      })
    })

    it('should return null if token batch returns null', async () => {
      let resolveTokenLeases: (config: StanzaTokenLeasesResult | null) => void = () => {
      }
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((resolve) => {
        resolveTokenLeases = resolve
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      resolveTokenLeases(null)

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual(null)
    })

    it('should return null if token batch throws', async () => {
      let rejectTokenLeases: (reason: Error) => void = () => {}
      mockHubService.getTokenLease.mockImplementation(async () => new Promise<StanzaTokenLeasesResult | null>((_resolve, reject) => {
        rejectTokenLeases = reject
      }))

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        decorator: 'testDecorator'
      })

      rejectTokenLeases(new Error('An error'))

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual(null)
    })
  })
})
