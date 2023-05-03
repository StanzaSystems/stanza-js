import { afterEach, describe, expect, it, vi } from 'vitest'
import { hubService, updateHubService } from './hubService'

const originalHubService = hubService

describe('global', function () {
  describe('hubService', function () {
    afterEach(async () => {
      vi.resetModules()
      updateHubService(originalHubService)
    })

    it('should throw initially', async function () {
      await expect(hubService.fetchServiceConfig()).rejects.toThrow('Hub Service not initialized yet')
    })

    it('should update hub service', async function () {
      updateHubService({
        fetchServiceConfig: async () => Promise.resolve(null),
        fetchDecoratorConfig: async () => Promise.resolve(null),
        getToken: async () => Promise.resolve(null),
        getTokenLease: async () => Promise.resolve(null),
        validateToken: async () => Promise.resolve(null)
      })

      await expect(hubService.fetchServiceConfig()).resolves.toBeNull()
    })
  })
})
