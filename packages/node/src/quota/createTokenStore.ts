import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'
import { type StanzaToken } from '../hub/model'

interface DecoratorTokenStore {
  fetchTokensIfNecessary: (query: TokenQuery) => Promise<StanzaToken | null>
}
export const createTokenStore = (): TokenStore => {
  const decoratorTokenStores: Record<string, DecoratorTokenStore> = {}

  return {
    getToken: async (query) => {
      const { fetchTokensIfNecessary } = getDecoratorTokenStore(query.decorator)
      return fetchTokensIfNecessary(query)
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
  let getTokenLeaseInProgress: Promise<StanzaToken | null> | undefined

  return { fetchTokensIfNecessary }

  async function fetchTokensIfNecessary (query: TokenQuery): Promise<StanzaToken | null> {
    const tokenInState = state.popToken(query)
    if (tokenInState !== null) {
      return {
        granted: true,
        token: tokenInState.token
      }
    }

    if (getTokenLeaseInProgress === undefined) {
      getTokenLeaseInProgress = requestTokenLease(query)
    } else {
      getTokenLeaseInProgress = getTokenLeaseInProgress.then(async (result) => {
        if (result?.granted === false) {
          return { granted: false }
        }
        const tokenInState = state.popToken(query)
        return tokenInState !== null ? { granted: true, token: tokenInState.token } : requestTokenLease(query)
      })
    }
    return getTokenLeaseInProgress ?? null
  }

  async function requestTokenLease (query: TokenQuery): Promise<StanzaToken | null> {
    const tokenLeases = await hubService.getTokenLease({
      ...query,
      decorator
    }).catch(() => null)
    getTokenLeaseInProgress = undefined

    if (tokenLeases === null) {
      return null
    }

    if (tokenLeases.granted) {
      state.addTokens(tokenLeases.leases)
    }
    const tokenInState = state.popToken(query)
    return tokenInState !== null ? { granted: true, token: tokenInState.token } : { granted: false }
  }
}
