import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockHubService } from '../__tests__/mocks/mockHubService'
import { getQuota } from './getQuota'
import { type TokenStore } from './tokenStore'
import { createTokenStore } from './createTokenStore'

vi.mock('../global/tokenStore', () => {
  return {
    tokenStore: {
      getToken: async (...args) => mockTokenStore.getToken(...args),
      markTokenAsConsumed: (...args) => { mockTokenStore.markTokenAsConsumed(...args) }
    } satisfies TokenStore
  }
})

const mockTokenStore = {
  getToken: vi.fn(),
  markTokenAsConsumed: vi.fn()
} satisfies TokenStore

beforeEach(() => {
  const tokenStore = createTokenStore()

  mockHubService.reset()
  mockTokenStore.getToken.mockReset()
  mockTokenStore.markTokenAsConsumed.mockReset()

  mockTokenStore.getToken.mockImplementation(tokenStore.getToken)
  mockTokenStore.markTokenAsConsumed.mockImplementation(tokenStore.markTokenAsConsumed)
})
describe('getQuota', function () {
  describe('non strictSynchronousQuota', () => {
    beforeEach(() => {
      mockHubService.reset()
      vi.useFakeTimers({
        now: 0
      })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return null if getting quota times out', async function () {
      const getQuotaPromise = getQuota({ guard: 'testDecorator' })
      await vi.advanceTimersByTimeAsync(1000)
      await expect(getQuotaPromise).resolves.toEqual(null)
    })

    it('should get quota if hubService returns valid token', async () => {
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return Promise.resolve({ granted: true, leases: [{ token: 'testToken', expiresAt: 500, feature: 'testFeature', priorityBoost: 0 }] })
      })

      await expect(getQuota({ guard: 'testDecorator' })).resolves.toEqual({
        granted: true,
        token: 'testToken'
      })
    })
  })
})
