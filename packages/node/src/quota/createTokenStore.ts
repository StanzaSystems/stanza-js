import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'
import { type StanzaToken } from '../hub/model'

const MARK_TOKENS_AS_CONSUMED_DELAY = 100

interface DecoratorTokenStore {
  fetchTokensIfNecessary: (query: TokenQuery) => Promise<StanzaToken | null>
}
export const createTokenStore = (): TokenStore => {
  const decoratorTokenStores: Record<string, DecoratorTokenStore> = {}
  let tokensConsumed = Array<string>()
  let tokensConsumedTimeout: ReturnType<typeof setTimeout> | undefined

  return {
    getToken: async (query) => {
      const { fetchTokensIfNecessary } = getDecoratorTokenStore(query.decorator)
      return fetchTokensIfNecessary(query)
    },
    markTokenAsConsumed: (token) => {
      tokensConsumed.push(token)

      if (tokensConsumedTimeout === undefined) {
        tokensConsumedTimeout = setTimeout(() => {
          void (async () => {
            const tokensToConsume = tokensConsumed
            tokensConsumed = []
            tokensConsumedTimeout = undefined

            console.log(`🍽 🍽 🍽 🍽 🍽️\t tokens consumed: ${tokensToConsume.length} \t\t🍽 🍽 🍽 🍽 🍽`)
            await hubService.markTokensAsConsumed({ tokens: tokensToConsume })
          })().catch()
        }, MARK_TOKENS_AS_CONSUMED_DELAY)
      }
    }
  }

  function getDecoratorTokenStore (decoratorName: string) {
    decoratorTokenStores[decoratorName] = decoratorTokenStores[decoratorName] ?? createDecoratorTokenStore(decoratorName)
    return decoratorTokenStores[decoratorName]
  }
}

function createDecoratorTokenStore (decorator: string): DecoratorTokenStore {
  const state = createTokenState()
  let getTokenLeaseInProgress: Promise<StanzaToken | null> | undefined

  state.onTokensAvailableRatioChange(2000, (ratio) => {
    if (ratio <= 0.2 && getTokenLeaseInProgress === undefined) {
      getTokenLeaseInProgress = fetchMoreTokenLeases().then(() => null)
    }
  })

  let waitingForTokensCount = 0

  return { fetchTokensIfNecessary }

  async function fetchTokensIfNecessary (query: TokenQuery): Promise<StanzaToken | null> {
    const tokenInState = state.popToken(query)
    if (tokenInState !== null) {
      console.log('📤📤📤📤📤\t getting token from cache 🥳 \t📤📤📤📤📤')
      return {
        granted: true,
        token: tokenInState.token
      }
    }

    if (getTokenLeaseInProgress === undefined) {
      getTokenLeaseInProgress = requestTokenLease(query)
    } else {
      waitingForTokensCount++
      console.log(`⌛  ⌛  ⌛  ⌛  ⌛  \t START waiting for tokens: ${waitingForTokensCount.toFixed(0)} \t⌛  ⌛  ⌛  ⌛  ⌛ `)
      getTokenLeaseInProgress = getTokenLeaseInProgress.then(async (result) => {
        waitingForTokensCount--
        console.log(`▶️ ▶️ ▶️ ▶️ ▶️ \t END waiting for tokens: ${waitingForTokensCount.toFixed(0)} \t▶️ ▶️ ▶️ ▶️ ▶️ `)
        if (result?.granted === false) {
          return { granted: false }
        }
        const tokenInState = state.popToken(query)
        return tokenInState !== null ? { granted: true, token: tokenInState.token } : requestTokenLease(query)
      })
    }
    return getTokenLeaseInProgress ?? null
  }

  async function fetchMoreTokenLeases (query: TokenQuery = {}) {
    console.log('🏃 🏃 🏃 🏃 🏃 \t fetching more tokens \t🏃 🏃 🏃 🏃 🏃')
    const tokenLeases = await hubService.getTokenLease({
      ...query,
      decorator
    }).catch(() => null)
    getTokenLeaseInProgress = undefined

    if (tokenLeases?.granted === true) {
      console.log(`📥 📥 📥 📥 📥 \t adding tokens ${tokenLeases.leases.length} \t\t📥 📥 📥 📥 📥`)
      state.addTokens(tokenLeases.leases)
    }
    return tokenLeases
  }

  async function requestTokenLease (query: TokenQuery): Promise<StanzaToken | null> {
    const tokenLeases = await fetchMoreTokenLeases(query)

    if (tokenLeases === null) {
      return null
    }

    const tokenInState = state.popToken(query)
    return tokenInState !== null ? { granted: true, token: tokenInState.token } : { granted: false }
  }
}
