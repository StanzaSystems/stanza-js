import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'
import { type TokenQuery } from './tokenState'
import { type StanzaToken } from '../hub/model'
import { logger } from '../global/logger'

const MARK_TOKENS_AS_CONSUMED_DELAY = 100
const TOKEN_EXPIRE_OFFSET = 2000

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

type TokenLeaseState<T extends string, O = Record<never, never>> = {
  readonly type: T
} & O

type TokenLeaseIdleState = TokenLeaseState<'idle'>
type TokenLeaseValueState = TokenLeaseState<'value', {
  value: StanzaToken | null
}>
type TokenLeaseInProgressState = TokenLeaseIdleState | TokenLeaseValueState

function createDecoratorTokenStore (decorator: string): DecoratorTokenStore {
  const state = createTokenState()
  let getTokenLeaseInProgress: Promise<TokenLeaseInProgressState> = Promise.resolve<TokenLeaseInProgressState>({ type: 'idle' })

  state.onTokensAvailableRatioChange(TOKEN_EXPIRE_OFFSET, (ratio) => {
    if (ratio <= 0.2) {
      getTokenLeaseInProgress = getTokenLeaseInProgress.then(async result =>
        result.type === 'idle'
          ? fetchMoreTokenLeases().then(() => ({ type: 'value', value: null }))
          : result
      )
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

    const getTokenLeaseValuePromise = getTokenLeaseInProgress.then(async (tokenInProgressState): Promise<TokenLeaseValueState> => {
      if (tokenInProgressState.type === 'value' && tokenInProgressState.value?.granted === false) {
        logger.trace('❌ ❌ ❌ ❌ ❌ \t not granted \t ❌ ❌ ❌ ❌ ❌')
        return tokenInProgressState
      }
      const tokenInState = state.popToken(query)
      let value
      if (tokenInState !== null) {
        value = { granted: true, token: tokenInState.token }
      } else {
        waitingForTokensCount++
        logger.trace('⌛ ⌛ ⌛ ⌛ ⌛ \t waiting for tokens: %d \t⌛ ⌛ ⌛ ⌛ ⌛ ', waitingForTokensCount)
        value = await requestTokenLease(query)
        waitingForTokensCount--
        logger.trace('▶️  ▶️  ▶️  ▶️  ▶️  \t finished waiting for tokens: %d \t▶️  ▶️  ▶️  ▶️  ▶️ ', waitingForTokensCount)

      }
      // const value = tokenInState !== null ? { granted: true, token: tokenInState.token } : await requestTokenLease(query)
      return { type: 'value', value }
    })

    getTokenLeaseInProgress = getTokenLeaseValuePromise

    const { value } = await getTokenLeaseValuePromise
    return value
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
