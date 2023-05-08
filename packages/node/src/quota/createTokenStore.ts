import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'
import { type StanzaTokenLease } from '../hub/model'

interface DecoratorTokenStore {
  fetchTokensIfNecessary: (query: TokenQuery) => Promise<StanzaTokenLease | null>
}
export const createTokenStore = (): TokenStore => {
  const decoratorTokenStores: Record<string, DecoratorTokenStore> = {}

  return {
    getToken: async (query) => {
      const { fetchTokensIfNecessary } = getDecoratorTokenStore(query.decorator)
      const tokenLease = await fetchTokensIfNecessary(query)

      return tokenLease?.token ?? null
    },
    markTokenAsConsumed: () => {}
  }

  function getDecoratorTokenStore (decoratorName: string) {
    decoratorTokenStores[decoratorName] = decoratorTokenStores[decoratorName] ?? createDecoratorTokenStore(decoratorName)
    return decoratorTokenStores[decoratorName]
  }
}

function createDecoratorTokenStore (decorator: string): DecoratorTokenStore {
  const state = createTokenState()
  let getTokenLeaseInProgress: Promise<StanzaTokenLease | null> | undefined

  return { fetchTokensIfNecessary }

  async function fetchTokensIfNecessary (query: TokenQuery): Promise<StanzaTokenLease | null> {
    if (state.hasToken(query)) {
      return state.popToken(query)
    }

    if (getTokenLeaseInProgress === undefined) {
      getTokenLeaseInProgress = requestTokenLease(query)
    } else {
      getTokenLeaseInProgress = getTokenLeaseInProgress.then(async () => {
        if (state.hasToken(query)) {
          return state.popToken(query)
        }
        return requestTokenLease(query)
      })
    }
    return getTokenLeaseInProgress
  }

  async function requestTokenLease (query: TokenQuery) {
    const tokenLeases = await hubService.getTokenLease({
      ...query,
      decorator
    })
    getTokenLeaseInProgress = undefined
    if (tokenLeases !== null) {
      state.addTokens(tokenLeases)
    }
    return state.popToken(query)
  }
}
