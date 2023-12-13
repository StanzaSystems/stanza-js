import { afterEach, describe, expect, it, vi } from 'vitest';
import { hubService, updateHubService } from './hubService';
import { Health } from '@getstanza/hub-client-api';

const originalHubService = hubService;

describe('global', function () {
  describe('hubService', function () {
    afterEach(async () => {
      vi.resetModules();
      updateHubService(originalHubService);
    });

    it('should throw initially', async function () {
      await expect(hubService.fetchServiceConfig()).rejects.toThrow(
        'Hub Service not initialized yet'
      );
    });

    it('should update hub service', async function () {
      updateHubService({
        getServiceMetadata: () => ({
          serviceName: 'updateService',
          serviceRelease: '1.0.0',
          environment: 'updatedEnv',
          clientId: 'updatedClientId',
        }),
        fetchServiceConfig: async () => Promise.resolve(null),
        fetchGuardConfig: async () => Promise.resolve(null),
        getToken: async () => Promise.resolve(null),
        getTokenLease: async () => Promise.resolve(null),
        validateToken: async () => Promise.resolve(null),
        markTokensAsConsumed: async () => Promise.resolve(null),
        getAuthToken: async () => Promise.resolve(null),
        getGuardHealth: async () => Promise.resolve(Health.Unspecified),
      });

      await expect(hubService.fetchServiceConfig()).resolves.toBeNull();
    });
  });
});
