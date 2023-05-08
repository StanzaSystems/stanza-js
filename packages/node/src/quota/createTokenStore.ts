import { type TokenStore, type TokenStoreQuery } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'

export const createTokenStore = (): TokenStore => {
  const state = createTokenState()
  let getTokenLeaseInProgress: Promise<void> | undefined

  return {
    getToken: async (query) => {
      await fetchTokensIfNecessary(query)

      return state.popToken(query)?.token ?? null
    },
    markTokenAsConsumed: () => {}
  }

  async function fetchTokensIfNecessary (query: TokenStoreQuery) {
    if (!state.hasToken(query) && getTokenLeaseInProgress === undefined) {
      getTokenLeaseInProgress = hubService.getTokenLease({
        ...query
      }).then(tokenLeases => {
        getTokenLeaseInProgress = undefined
        if (tokenLeases !== null) {
          state.addTokens(tokenLeases)
        }
      })
    }
    return getTokenLeaseInProgress
  }
}
