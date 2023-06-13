import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'
import { type StanzaToken } from '../hub/model'
import { logger } from '../global/logger'

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

            logger.trace(`🍽 🍽 🍽 🍽 🍽️\t tokens consumed: ${tokensToConsume.length} \t\t🍽 🍽 🍽 🍽 🍽`)
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

type TokenLeaseState<T extends string, O= Record<never, never>> = {
  readonly type: T
} & O

type TokenLeaseInProgressState = TokenLeaseState<'idle'> | TokenLeaseState<'pending'> | TokenLeaseState<'value', {
  value: StanzaToken | null
}>

function createDecoratorTokenStore (decorator: string): DecoratorTokenStore {
  const state = createTokenState()
  let getTokenLeaseInProgress: Promise<TokenLeaseInProgressState> = Promise.resolve<TokenLeaseInProgressState>({ type: 'idle' })

  state.onTokensAvailableRatioChange(2000, (ratio) => {
    if (ratio <= 0.2) {
      getTokenLeaseInProgress = getTokenLeaseInProgress.then(async result => {
        if (result.type === 'idle') {
          return fetchMoreTokenLeases().then(() => ({ type: 'value', value: null }))
        }
        return result
      })
    }
  })

  let waitingForTokensCount = 0

  return { fetchTokensIfNecessary }

  async function fetchTokensIfNecessary (query: TokenQuery): Promise<StanzaToken | null> {
    const tokenInState = state.popToken(query)
    if (tokenInState !== null) {
      logger.trace('📤📤📤📤📤\t getting token from cache 🥳 \t📤📤📤📤📤')
      return {
        granted: true,
        token: tokenInState.token
      }
    }

    getTokenLeaseInProgress = getTokenLeaseInProgress.then(async (tokenInProgressState): Promise<TokenLeaseInProgressState> => {
      if (tokenInProgressState.type === 'idle') {
        return requestTokenLease(query).then(value => ({ type: 'value', value }))
      } else {
        waitingForTokensCount++
        logger.trace('⌛ ⌛ ⌛ ⌛ ⌛ \t waiting for tokens: %d \t⌛ ⌛ ⌛ ⌛ ⌛ ', waitingForTokensCount)
        if (tokenInProgressState.type === 'value') {
          waitingForTokensCount--
          logger.trace('▶️  ▶️  ▶️  ▶️  ▶️  \t finished waiting for tokens: %d \t▶️  ▶️  ▶️  ▶️  ▶️ ', waitingForTokensCount)
          if (tokenInProgressState.value?.granted === false) {
            logger.trace('❌ ❌ ❌ ❌ ❌ \t not granted \t ❌ ❌ ❌ ❌ ❌')
            return {
              type: 'value',
              value: {
                granted: false
              }
            }
          }
          const tokenInState = state.popToken(query)
          const value = tokenInState !== null ? { granted: true, token: tokenInState.token } : await requestTokenLease(query)
          return { type: 'value', value }
        }
        const value = await requestTokenLease(query)
        return { type: 'value', value }
      }
    })

    const result = await getTokenLeaseInProgress ?? null

    return result?.type === 'value' ? result.value : null
  }

  async function fetchMoreTokenLeases (query: TokenQuery = {}) {
    logger.trace('🏃 🏃 🏃 🏃 🏃 \t fetching more tokens \t🏃 🏃 🏃 🏃 🏃')
    const tokenLeases = await hubService.getTokenLease({
      ...query,
      decorator
    }).catch(() => null)
    logger.trace('‼️  ‼️  ‼️  ‼️  ‼️ ️\t clearing getTokenLeaseInProgress \t\t‼️  ‼️  ‼️  ‼️  ‼️ ')

    getTokenLeaseInProgress = getTokenLeaseInProgress.then(() => ({ type: 'idle' }))

    if (tokenLeases?.granted === true) {
      logger.trace(`📥 📥 📥 📥 📥 \t adding tokens ${tokenLeases.leases.length} \t\t📥 📥 📥 📥 📥`)
      state.addTokens(tokenLeases.leases)
    }
    tokenLeases?.granted !== true && logger.trace('leases: %o', tokenLeases)
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
