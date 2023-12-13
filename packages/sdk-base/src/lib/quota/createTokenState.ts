import { type StanzaTokenLease } from '@getstanza/hub-client-api';
import {
  type AvailableRatioListenerFn,
  type AvailableRatioListener,
  type TokenQuery,
  type TokenState,
} from './tokenState';

const isTokenValidAfter =
  (expirationTime: number) =>
  ({ expiresAt }: StanzaTokenLease) =>
    expiresAt > expirationTime;

export const createTokenState = (): TokenState => {
  let tokenLeases = Array<StanzaTokenLease>();
  let tokensUsed = Array<StanzaTokenLease>();
  const availableRatioListeners = Array<AvailableRatioListener>();
  let tokenExpiresCallbackHandle: ReturnType<typeof setTimeout> | undefined;

  onTokensAvailableRatioChange(0, clearExpiredTokens);

  return {
    addTokens,
    hasToken,
    popToken,
    onTokensAvailableRatioChange,
  };

  function addTokens(leases: StanzaTokenLease[]) {
    tokenLeases.push(...leases);
    tokensUsed = [];
    onChange();
  }

  function hasToken({ feature, priorityBoost }: TokenQuery = {}) {
    const now = Date.now();

    return tokenLeases.some((lease) => {
      const isNotExpired = lease.expiresAt > now;
      const featureMatch = feature === undefined || lease.feature === feature;
      const priorityBoostMatch =
        priorityBoost === undefined || lease.priorityBoost >= priorityBoost;
      return isNotExpired && featureMatch && priorityBoostMatch;
    });
  }
  function popToken({ feature, priorityBoost }: TokenQuery = {}) {
    const now = Date.now();

    const tokenIndex = tokenLeases.findIndex((lease) => {
      const isNotExpired = lease.expiresAt > now;
      const featureMatch = feature === undefined || lease.feature === feature;
      const priorityBoostMatch =
        priorityBoost === undefined || lease.priorityBoost >= priorityBoost;
      return isNotExpired && featureMatch && priorityBoostMatch;
    });

    const result =
      tokenIndex >= 0 ? tokenLeases.splice(tokenIndex, 1)[0] : null;

    if (result !== null) {
      tokensUsed.push(result);
      onChange();
    }

    return result;
  }
  function onTokensAvailableRatioChange(
    expiresOffset: number,
    listener: AvailableRatioListenerFn
  ) {
    availableRatioListeners.push({
      listener,
      expiresOffset,
    });
    scheduleTokenExpiresCallback();
  }

  function onChange() {
    const availableCount = tokenLeases.length;
    const totalCount = availableCount + tokensUsed.length;
    const availableRatio = totalCount !== 0 ? availableCount / totalCount : 0;
    availableRatioListeners.forEach(({ listener }) => {
      setTimeout(() => {
        listener(availableRatio);
      });
    });
    scheduleTokenExpiresCallback();
  }

  function scheduleTokenExpiresCallback() {
    if (tokenExpiresCallbackHandle !== undefined) {
      clearTimeout(tokenExpiresCallbackHandle);
      tokenExpiresCallbackHandle = undefined;
    }

    const now = Date.now();

    const tokensNotifyAt = availableRatioListeners
      .map((listener) =>
        tokenLeases.map(({ expiresAt }) => ({
          ...listener,
          notifyAt: expiresAt - listener.expiresOffset,
        }))
      )
      .flat(1)
      .filter(({ notifyAt }) => notifyAt - now > 0);

    if (tokensNotifyAt.length === 0) {
      return;
    }

    const earliestNotifyAt = Math.min(
      ...tokensNotifyAt.map(({ notifyAt }) => notifyAt)
    );
    const listeners = tokensNotifyAt.filter(
      ({ notifyAt }) => notifyAt === earliestNotifyAt
    );
    const timeout = earliestNotifyAt - now;

    tokenExpiresCallbackHandle = setTimeout(() => {
      notifyAvailableRatioListeners(listeners);
    }, timeout);
  }

  function clearExpiredTokens() {
    const now = Date.now();
    const isValid = ({ expiresAt }: StanzaTokenLease) => expiresAt > now;
    const [expiredTokenLeases, validTokenLeases] = tokenLeases.reduce<
      [StanzaTokenLease[], StanzaTokenLease[]]
    >(
      (groups, value) => {
        const predicateResult = isValid(value);
        const key = predicateResult ? 1 : 0;
        groups[key].push(value);
        return groups;
      },
      [[], []]
    );

    tokenLeases = validTokenLeases;
    tokensUsed.push(...expiredTokenLeases);
  }

  function notifyAvailableRatioListeners(listeners: AvailableRatioListener[]) {
    const now = Date.now();
    const totalCount = tokenLeases.length + tokensUsed.length;
    listeners.forEach(({ listener, expiresOffset }) => {
      const stanzaTokenLeasesValid = tokenLeases.filter(
        isTokenValidAfter(now + expiresOffset)
      );
      const availableCount = stanzaTokenLeasesValid.length;
      const availableRatio = totalCount !== 0 ? availableCount / totalCount : 0;
      listener(availableRatio);
    });
    scheduleTokenExpiresCallback();
  }
};
