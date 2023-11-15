import { type TokenStore } from './tokenStore';
import { hubService } from '../global/hubService';
import { createTokenState } from './createTokenState';
import { type TokenQuery } from './tokenState';
import { type StanzaToken } from '../hub/model';

const MARK_TOKENS_AS_CONSUMED_DELAY = 100;
const TOKEN_EXPIRE_OFFSET = 2000;

interface GuardTokenStore {
  fetchTokensIfNecessary: (query: TokenQuery) => Promise<StanzaToken | null>;
}
export const createTokenStore = (): TokenStore => {
  const guardTokenStores: Record<string, GuardTokenStore> = {};
  let tokensConsumed = Array<string>();
  let tokensConsumedTimeout: ReturnType<typeof setTimeout> | undefined;

  return {
    getToken: async (query) => {
      const { fetchTokensIfNecessary } = getGuardTokenStore(query.guard);
      return fetchTokensIfNecessary(query);
    },
    markTokenAsConsumed: (token) => {
      tokensConsumed.push(token);
      if (tokensConsumedTimeout === undefined) {
        tokensConsumedTimeout = setTimeout(() => {
          (async () => {
            const tokensToConsume = tokensConsumed;
            tokensConsumed = [];
            tokensConsumedTimeout = undefined;

            await hubService.markTokensAsConsumed({ tokens: tokensToConsume });
          })().catch(() => null);
        }, MARK_TOKENS_AS_CONSUMED_DELAY);
      }
    },
  };

  function getGuardTokenStore(guardName: string) {
    guardTokenStores[guardName] =
      guardTokenStores[guardName] ?? createGuardTokenStore(guardName);
    return guardTokenStores[guardName];
  }
};

function createGuardTokenStore(guard: string): GuardTokenStore {
  const state = createTokenState();
  let tokenLeaseInProgressCount = 0;
  state.onTokensAvailableRatioChange(TOKEN_EXPIRE_OFFSET, (ratio) => {
    if (ratio <= 0.2 && tokenLeaseInProgressCount === 0) {
      refillTokenStoreCache().catch(() => {});
    }
  });

  return { fetchTokensIfNecessary };

  async function fetchTokensIfNecessary(
    query: TokenQuery
  ): Promise<StanzaToken | null> {
    const tokenInState = state.popToken(query);
    if (tokenInState !== null) {
      return {
        granted: true,
        token: tokenInState.token,
      };
    }
    return requestTokenLease(query);
  }

  async function refillTokenStoreCache() {
    const tokenLeases = await fetchMoreTokenLeases();

    if (tokenLeases?.granted === true) {
      state.addTokens(tokenLeases.leases);
    }
    return tokenLeases;
  }

  async function getTokenLease(
    query: TokenQuery = {}
  ): Promise<StanzaToken | null> {
    const tokenLeases = await fetchMoreTokenLeases(query);

    if (tokenLeases === null) {
      return null;
    }

    if (!tokenLeases.granted || tokenLeases.leases.length === 0) {
      return { granted: false };
    }

    const [firstToken, ...additionalTokenLeases] = tokenLeases.leases;

    if (additionalTokenLeases.length > 0) {
      state.addTokens(additionalTokenLeases);
    }
    return { granted: true, token: firstToken.token };
  }

  async function fetchMoreTokenLeases(query: TokenQuery = {}) {
    tokenLeaseInProgressCount++;
    return hubService
      .getTokenLease({
        ...query,
        guard,
      })
      .finally(() => {
        tokenLeaseInProgressCount--;
      })
      .catch(() => null);
  }

  async function requestTokenLease(
    query: TokenQuery
  ): Promise<StanzaToken | null> {
    const tokenLease = await getTokenLease(query);

    if (tokenLease === null) {
      return null;
    }

    return tokenLease;
  }
}
