import {
  afterEach,
  assert,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { createTokenStore } from './createTokenStore';
import { type TokenStore } from './tokenStore';
import { mockHubService } from '../__tests__/mocks/mockHubService';
import { type StanzaTokenLeasesResult } from '@getstanza/hub-client-api';

describe('tokenStore', () => {
  beforeEach(() => {
    mockHubService.reset();
    vi.useFakeTimers({
      now: 0,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create token store', () => {
    expect(createTokenStore).not.toThrow();
  });

  describe('getToken', () => {
    let tokenStore: TokenStore;

    beforeEach(() => {
      tokenStore = createTokenStore();
    });

    it('should fetch tokens initially', async () => {
      void tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();
    });

    it('should return token returned from getTokenLeases', async () => {
      let resolveTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementationOnce(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases = resolve;
          })
      );

      const getTokenFromStorePromise = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      resolveTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await expect(getTokenFromStorePromise).resolves.toEqual({
        granted: true,
        token: 'testToken',
      });
    });

    it('should return token second token without calling hub again', async () => {
      let resolveTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementationOnce(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases = resolve;
          })
      );

      void tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      resolveTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken1',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken2',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await vi.advanceTimersByTimeAsync(0);

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        guard: 'testGuard',
      });

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      await expect(getSecondTokenFromStorePromise).resolves.toEqual({
        granted: true,
        token: 'testToken2',
      });
    });

    it('should fetch new token leases if current state does not contain token for a given query', async () => {
      let resolveTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases = resolve;
          })
      );

      void tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      resolveTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken1',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken2',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await vi.advanceTimersByTimeAsync(0);

      const getSecondTokenFromStorePromise = tokenStore.getToken({
        guard: 'testGuard',
        feature: 'anotherFeature',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      resolveTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken3',
            feature: 'anotherFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken4',
            feature: 'anotherFeature',
            expiresAt: 300,
            priorityBoost: 4,
          },
        ],
      });

      await expect(getSecondTokenFromStorePromise).resolves.toEqual({
        granted: true,
        token: 'testToken3',
      });
    });

    it('should call getTokenLeases only for each request if not matching tokens in cache', async () => {
      const resolveTokenLeases: Array<
        (config: StanzaTokenLeasesResult | null) => void
      > = [];
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases.push(resolve);
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      resolveTokenLeases[0]({
        granted: true,
        leases: [
          {
            token: 'testToken1',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });
      resolveTokenLeases[1]({
        granted: true,
        leases: [
          {
            token: 'testToken2',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: true,
        token: 'testToken1',
      });
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({
        granted: true,
        token: 'testToken2',
      });
    });

    it('should get tokens for 2 different guards separately', async () => {
      let resolveFirstTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      let resolveSecondTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementationOnce(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveFirstTokenLeases = resolve;
          })
      );
      mockHubService.getTokenLease.mockImplementationOnce(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveSecondTokenLeases = resolve;
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        guard: 'anotherTestGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      resolveFirstTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken1',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      resolveSecondTokenLeases({
        granted: true,
        leases: [
          {
            token: 'testToken2',
            feature: 'anotherTestFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: true,
        token: 'testToken1',
      });
      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({
        granted: true,
        token: 'testToken2',
      });
    });

    it('should cache tokens from first batch to be used by next requests', async () => {
      const resolveTokenLeases: Array<
        (config: StanzaTokenLeasesResult | null) => void
      > = [];
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases.push(resolve);
          })
      );

      const getTokenFromStoreBatchFirst = [
        tokenStore.getToken({
          guard: 'testGuard',
        }),
        tokenStore.getToken({
          guard: 'testGuard',
        }),
      ];

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      resolveTokenLeases[0]({
        granted: true,
        leases: [
          {
            token: 'testToken0',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken1',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });
      resolveTokenLeases[1]({
        granted: true,
        leases: [
          {
            token: 'testToken2',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken3',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await expect(getTokenFromStoreBatchFirst[0]).resolves.toEqual({
        granted: true,
        token: 'testToken0',
      });
      await expect(getTokenFromStoreBatchFirst[1]).resolves.toEqual({
        granted: true,
        token: 'testToken2',
      });

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      const getTokenFromStoreBatchSecond = [
        tokenStore.getToken({
          guard: 'testGuard',
        }),
        tokenStore.getToken({
          guard: 'testGuard',
        }),
      ];

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);

      await expect(getTokenFromStoreBatchSecond[0]).resolves.toEqual({
        granted: true,
        token: 'testToken1',
      });
      await expect(getTokenFromStoreBatchSecond[1]).resolves.toEqual({
        granted: true,
        token: 'testToken3',
      });

      const getTokenFromStoreBatchThird = [
        tokenStore.getToken({
          guard: 'testGuard',
        }),
      ];
      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(3);

      resolveTokenLeases[2]({
        granted: true,
        leases: [
          {
            token: 'testToken4',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken5',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
          {
            token: 'testToken6',
            feature: 'testFeature',
            expiresAt: 300,
            priorityBoost: 0,
          },
        ],
      });

      await expect(getTokenFromStoreBatchThird[0]).resolves.toEqual({
        granted: true,
        token: 'testToken4',
      });

      const getTokenFromStoreBatchForth = [
        tokenStore.getToken({
          guard: 'testGuard',
        }),
        tokenStore.getToken({
          guard: 'testGuard',
        }),
      ];

      await expect(getTokenFromStoreBatchForth[0]).resolves.toEqual({
        granted: true,
        token: 'testToken5',
      });
      await expect(getTokenFromStoreBatchForth[1]).resolves.toEqual({
        granted: true,
        token: 'testToken6',
      });
    });

    it('should fail the getToken if token batch is not granted', async () => {
      let resolveTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases = resolve;
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      resolveTokenLeases({
        granted: false,
      });

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: false,
      });
    });

    it('should fail all current getToken if token batch is not granted', async () => {
      const resolveTokenLeases: Array<
        (config: StanzaTokenLeasesResult | null) => void
      > = [];
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases.push(resolve);
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      resolveTokenLeases[0]({
        granted: false,
      });
      resolveTokenLeases[1]({
        granted: false,
      });

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual({
        granted: false,
      });

      await expect(getTokenFromStorePromiseSecond).resolves.toEqual({
        granted: false,
      });
    });

    it('should fetch tokens again after one getToken rejection', async () => {
      const resolveTokenLeases: Array<
        (config: StanzaTokenLeasesResult | null) => void
      > = [];
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases.push(resolve);
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });
      const getTokenFromStorePromiseSecond = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      resolveTokenLeases[0]({
        granted: false,
      });
      resolveTokenLeases[1]({
        granted: false,
      });

      await getTokenFromStorePromiseFirst;
      await getTokenFromStorePromiseSecond;

      const getTokenFromStorePromiseThird = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      resolveTokenLeases[2]({
        granted: true,
        leases: [
          {
            token: 'testToken',
            feature: 'testFeature',
            priorityBoost: 0,
            expiresAt: 500,
          },
        ],
      });

      await expect(getTokenFromStorePromiseThird).resolves.toEqual({
        granted: true,
        token: 'testToken',
      });
    });

    it('should return null if token batch returns null', async () => {
      let resolveTokenLeases: (
        config: StanzaTokenLeasesResult | null
      ) => void = () => {};
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((resolve) => {
            resolveTokenLeases = resolve;
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      resolveTokenLeases(null);

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual(null);
    });

    it('should return null if token batch throws', async () => {
      let rejectTokenLeases: (reason: Error) => void = () => {};
      mockHubService.getTokenLease.mockImplementation(
        async () =>
          new Promise<StanzaTokenLeasesResult | null>((_resolve, reject) => {
            rejectTokenLeases = reject;
          })
      );

      const getTokenFromStorePromiseFirst = tokenStore.getToken({
        guard: 'testGuard',
      });

      await vi.advanceTimersByTimeAsync(0);

      rejectTokenLeases(new Error('An error'));

      await expect(getTokenFromStorePromiseFirst).resolves.toEqual(null);
    });
  });

  describe('markTokenAsConsumed', () => {
    let tokenStore: TokenStore;

    const MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY = 100;

    beforeEach(() => {
      tokenStore = createTokenStore();
    });

    it('should call markTokenAsResolved without errors', () => {
      expect(() => {
        tokenStore.markTokenAsConsumed('aToken');
      }).not.toThrow();
    });

    it("should not call hubService's markTokensAsResolved immediately", () => {
      tokenStore.markTokenAsConsumed('aToken');
      expect(mockHubService.markTokensAsConsumed).not.toHaveBeenCalled();
    });

    it(`should call hubService's markTokensAsResolved after ${MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY}ms`, async () => {
      tokenStore.markTokenAsConsumed('aToken');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();
      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledWith({
        tokens: ['aToken'],
      });
    });

    it("should NOT leak exception if hubService's markTokensAsResolved rejects", async () => {
      mockHubService.markTokensAsConsumed.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return Promise.reject(new Error('kaboom'));
      });

      tokenStore.markTokenAsConsumed('aToken');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(100);

      assert.ok('should not catch unhandled rejection or rejections');
    });

    it("should NOT leak exception if hubService's markTokensAsResolved throws", async () => {
      mockHubService.markTokensAsConsumed.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error('kaboom');
      });

      tokenStore.markTokenAsConsumed('aToken');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(100);

      assert.ok('should not catch unhandled exceptions or rejections');
    });

    it("should NOT leak exception if hubService's markTokensAsResolved throws synchronously", async () => {
      mockHubService.markTokensAsConsumed.mockImplementation(() => {
        throw new Error('kaboom');
      });

      tokenStore.markTokenAsConsumed('aToken');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(0);

      assert.ok('should not catch unhandled exceptions or rejections');
    });

    it(`should call hubService's markTokensAsResolved after ${MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY}ms with all the tokens provided during that time`, async () => {
      tokenStore.markTokenAsConsumed('aToken1');

      await vi.advanceTimersByTimeAsync(
        MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY / 4
      );

      tokenStore.markTokenAsConsumed('aToken2');

      await vi.advanceTimersByTimeAsync(
        MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY / 4
      );

      tokenStore.markTokenAsConsumed('aToken3');

      await vi.advanceTimersByTimeAsync(
        MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY / 4
      );

      tokenStore.markTokenAsConsumed('aToken4');

      await vi.advanceTimersByTimeAsync(
        MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY / 4
      );

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();
      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledWith({
        tokens: ['aToken1', 'aToken2', 'aToken3', 'aToken4'],
      });
    });

    it(`should not include the tokens that were provided after ${MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY}ms in the first call to hubService's markTokensAsResolved`, async () => {
      tokenStore.markTokenAsConsumed('aToken1');
      tokenStore.markTokenAsConsumed('aToken2');
      tokenStore.markTokenAsConsumed('aToken3');
      tokenStore.markTokenAsConsumed('aToken4');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      tokenStore.markTokenAsConsumed('aToken4');

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();
      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledWith({
        tokens: ['aToken1', 'aToken2', 'aToken3', 'aToken4'],
      });
    });

    it(`should include the tokens that were provided after ${MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY}ms in the second call to hubService's markTokensAsResolved`, async () => {
      tokenStore.markTokenAsConsumed('aToken1');
      tokenStore.markTokenAsConsumed('aToken2');
      tokenStore.markTokenAsConsumed('aToken3');
      tokenStore.markTokenAsConsumed('aToken4');

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      tokenStore.markTokenAsConsumed('aToken5');

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(MARK_TOKENS_AS_CONSUMED_EXPECTED_DELAY);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenCalledTimes(2);

      expect(mockHubService.markTokensAsConsumed).toHaveBeenLastCalledWith({
        tokens: ['aToken5'],
      });
    });
  });

  describe('refresh tokens', () => {
    let tokenStore: TokenStore;

    beforeEach(() => {
      tokenStore = createTokenStore();
    });

    it('should fetch more tokens if 80% of them get used', async () => {
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(11)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: 5000,
            })),
        };
      });
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(10)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index + 10}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: 7000,
            })),
        };
      });

      // token 0 returned immediately, 10 added to cache
      await tokenStore.getToken({ guard: 'aGuard' });

      for (let i = 1; i < 8; i++) {
        // use 7 out of 10 tokens from cache
        await tokenStore.getToken({ guard: 'aGuard' });
      }

      // still no need to fetch more tokens
      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      // using token 8 out of 10 tokens from cache
      await tokenStore.getToken({ guard: 'aGuard' });

      await vi.advanceTimersByTimeAsync(0);

      // need more tokens as only 2 left out of 10
      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);
    });

    it('should fetch more tokens if 80% of them expire in 2 seconds', async () => {
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(11)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: index < 9 ? 3000 : 5000,
            })),
        };
      });
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(10)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index + 10}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: 7000,
            })),
        };
      });

      await tokenStore.getToken({ guard: 'aGuard' });

      // token 0 is used, 10 in cache

      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(1000);

      // tokens 1-8 will expire in 2 seconds, 2 out of 10 will be valid after 2 seconds

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);
    });

    it('should fetch more tokens if 80% of them are used or expire in 2 seconds - first expire then used', async () => {
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(11)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: index < 4 ? 2500 : index < 8 ? 4500 : 5000,
            })),
        };
      });
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(10)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index + 10}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: 7000,
            })),
        };
      });

      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken0',
      });

      // token 0 is used, 10 tokens added to cache
      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(2500);

      // tokens 1-3 expired

      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken4',
      });
      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken5',
      });
      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken6',
      });
      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken7',
      });

      // tokens 4-7 are used, 3 remaining in cache - no need to fetch more yet

      await vi.advanceTimersByTimeAsync(0);
      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(1);

      await expect(tokenStore.getToken({ guard: 'aGuard' })).resolves.toEqual({
        granted: true,
        token: 'aToken8',
      });

      // tokens 4-8 are used, 2 remaining in cache - need more tokens

      await vi.advanceTimersByTimeAsync(0);

      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);
    });

    it('should fetch more tokens if 80% of them are used or expire in 2 seconds - first used then expire', async () => {
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(11)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: index < 4 ? 2500 : index < 9 ? 4500 : 5000,
            })),
        };
      });
      mockHubService.getTokenLease.mockImplementationOnce(async () => {
        return {
          granted: true,
          leases: Array(10)
            .fill(0)
            .map((_, index) => ({
              token: `aToken${index + 10}`,
              priorityBoost: 0,
              feature: '',
              expiresAt: 7000,
            })),
        };
      });

      // token 0 is used immediately and not added to cache, 10 tokens left in cache
      await tokenStore.getToken({ guard: 'aGuard' });
      // getting tokens 1-3 from cache
      await tokenStore.getToken({ guard: 'aGuard' });
      await tokenStore.getToken({ guard: 'aGuard' });
      await tokenStore.getToken({ guard: 'aGuard' });

      // tokens 0-3 are used
      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(2000);

      // still 2.5 seconds till tokens 4-8 expire
      expect(mockHubService.getTokenLease).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(500);

      // tokens 4-8 will expire in 2 seconds
      expect(mockHubService.getTokenLease).toHaveBeenCalledTimes(2);
    });
  });
});
