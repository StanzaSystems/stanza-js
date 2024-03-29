import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type GuardConfig } from '@getstanza/hub-client-api';
import { initQuotaChecker } from './quotaChecker';
import { updateGuardConfig } from '../../global/guardConfig';
import { mockHubService } from '../../__tests__/mocks/mockHubService';
import { logger } from '../../global/logger';

beforeEach(() => {
  mockHubService.reset();
});

describe('quotaChecker', () => {
  beforeEach(() => {
    // @ts-expect-error: resetting guard config
    updateGuardConfig(undefined);
  });

  describe('shouldCheckQuota()', () => {
    const { shouldCheckQuota } = initQuotaChecker({
      guard: 'testGuard',
    });

    it('should check quota', () => {
      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: [],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      expect(shouldCheckQuota()).toBe(true);
    });

    it('should NOT check quota', () => {
      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: false,
          quotaTags: [],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      expect(shouldCheckQuota()).toBe(false);
    });
  });

  describe('checkQuota()', () => {
    it('should send tag to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
        ],
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(mockHubService.getToken).toHaveBeenCalledOnce();
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
        ],
      });
    });

    it('should send multiple tags to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
          {
            key: 'anotherValidQuotaTag',
            value: 'another valid quota tag value',
          },
        ],
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(mockHubService.getToken).toHaveBeenCalledOnce();
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
          {
            key: 'anotherValidQuotaTag',
            value: 'another valid quota tag value',
          },
        ],
      });
    });

    it('should send only valid tag to get token lease', () => {
      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
          {
            key: 'invalidQuotaTag',
            value: 'invalid quota tag value',
          },
        ],
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(mockHubService.getToken).toHaveBeenCalledOnce();
      expect(mockHubService.getToken).toHaveBeenCalledWith({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
        ],
      });
    });

    it('should log skipped tags', () => {
      const infoSpy = vi.spyOn(logger, 'info');

      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
          {
            key: 'invalidQuotaTag',
            value: 'invalid quota tag value',
          },
          {
            key: 'anotherInvalidQuotaTag',
            value: 'another invalid quota tag value',
          },
        ],
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(infoSpy).toHaveBeenCalledOnce();
      expect(infoSpy).toHaveBeenCalledWith(
        "Unused tags in guard '%s'. Tags: %o",
        'testGuard',
        ['invalidQuotaTag', 'anotherInvalidQuotaTag']
      );
    });

    it('should NOT log if all tags are valid', () => {
      const infoSpy = vi.spyOn(logger, 'info');

      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
        tags: [
          {
            key: 'validQuotaTag',
            value: 'valid quota tag value',
          },
          {
            key: 'anotherValidQuotaTag',
            value: 'another valid quota tag value',
          },
        ],
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(infoSpy).not.toHaveBeenCalledOnce();
    });

    it('should NOT log if no tags are provided', () => {
      const infoSpy = vi.spyOn(logger, 'info');

      const { checkQuota } = initQuotaChecker({
        guard: 'testGuard',
      });

      updateGuardConfig('testGuard', {
        version: 'testVersion',
        config: {
          checkQuota: true,
          quotaTags: ['validQuotaTag', 'anotherValidQuotaTag'],
        } satisfies Partial<GuardConfig['config']> as any,
      });

      void checkQuota();

      expect(infoSpy).not.toHaveBeenCalledOnce();
    });
  });
});
