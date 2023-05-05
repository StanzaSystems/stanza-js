import { type StanzaTokenLease, type StanzaTokenLeases } from '../hub/model'

export interface TokenQuery {
  feature?: string
  priorityBoost?: number
}
const isTokenValidAfter = (expirationTime: number) => ({ expiresAt }: StanzaTokenLease) => expiresAt > expirationTime

type AvailableRatioListener = (ratioAvailable: number) => void

export interface TokenState {
  addTokens: (leases: StanzaTokenLeases) => void
  hasToken: (query?: TokenQuery) => boolean
  popToken: (query?: TokenQuery) => StanzaTokenLease | null
  onTokensAvailableRatioChange: (expiresOffset: number, listener: AvailableRatioListener) => void
}

export const createTokenState = (): TokenState => {
  const tokenLeases = Array<StanzaTokenLease>()
  const tokensUsed = Array<StanzaTokenLease>()
  const availableRatioListeners = Array<{ listener: AvailableRatioListener, expiresOffset: number }>()
  let tokenExpiresCallbackHandle: ReturnType<typeof setTimeout> | undefined

  return {
    addTokens: (leases) => {
      tokenLeases.push(...leases)
      onChange()
    },
    hasToken: ({ feature, priorityBoost } = {}) => {
      const now = Date.now()

      return tokenLeases.some((lease) => {
        const isNotExpired = lease.expiresAt > now
        const featureMatch = feature === undefined || lease.feature === feature
        const priorityBoostMatch = priorityBoost === undefined || lease.priorityBoost >= priorityBoost
        return isNotExpired && featureMatch && priorityBoostMatch
      })
    },
    popToken: ({ feature, priorityBoost } = {}) => {
      const now = Date.now()

      const tokenIndex = tokenLeases.findIndex((lease) => {
        const isNotExpired = lease.expiresAt > now
        const featureMatch = feature === undefined || lease.feature === feature
        const priorityBoostMatch = priorityBoost === undefined || lease.priorityBoost >= priorityBoost
        return isNotExpired && featureMatch && priorityBoostMatch
      })

      const result = tokenIndex >= 0 ? tokenLeases.splice(tokenIndex, 1)[0] : null

      if (result !== null) {
        tokensUsed.push(result)
        onChange()
      }

      return result
    },
    onTokensAvailableRatioChange: (expiresOffset, listener) => {
      availableRatioListeners.push({
        listener,
        expiresOffset
      })
      scheduleTokenExpiresCallback()
    }
  }

  function onChange () {
    const availableCount = tokenLeases.length
    const totalCount = availableCount + tokensUsed.length
    const availableRatio = totalCount !== 0 ? availableCount / totalCount : 0
    availableRatioListeners.forEach(({ listener }) => {
      setTimeout(() => {
        listener(availableRatio)
      })
    })
    scheduleTokenExpiresCallback()
  }

  function scheduleTokenExpiresCallback () {
    if (tokenExpiresCallbackHandle !== undefined) {
      clearTimeout(tokenExpiresCallbackHandle)
      tokenExpiresCallbackHandle = undefined
    }

    console.log('foo', availableRatioListeners.length)

    if (availableRatioListeners.length === 0) {
      return
    }
    console.log('foo')

    const earliestListenerOffset = Math.max(...availableRatioListeners.map(({ expiresOffset }) => expiresOffset))
    const now = Date.now()

    const tokensExpiringAfterOffset = tokenLeases
      .filter(isTokenValidAfter(now + earliestListenerOffset))

    if (tokensExpiringAfterOffset.length === 0) {
      return
    }

    const nextExpiresAt = Math.min(
      ...tokensExpiringAfterOffset
        .map(({ expiresAt }) => expiresAt)
    )
    const listeners = availableRatioListeners.filter(({ expiresOffset }) => expiresOffset === earliestListenerOffset).map(({ listener }) => listener)

    const notifyAt = nextExpiresAt - earliestListenerOffset

    const timeout = notifyAt - now

    console.log(timeout)

    tokenExpiresCallbackHandle = setTimeout(() => {
      const now = Date.now()
      const stanzaTokenLeasesValid = tokenLeases.filter(isTokenValidAfter(now + earliestListenerOffset))
      const availableCount = stanzaTokenLeasesValid.length
      const totalCount = tokenLeases.length + tokensUsed.length
      const availableRatio = totalCount !== 0 ? availableCount / totalCount : 0
      listeners.forEach((listener) => {
        listener(availableRatio)
      })
      scheduleTokenExpiresCallback()
    }, timeout)
  }

  // function clearExpiredTokens () {
  //   const now = Date.now()
  //   const isValid = ({ expiresAt }: StanzaTokenLease) => expiresAt > now
  //   const [expiredTokenLeases, validTokenLeases] = tokenLeases.reduce<[StanzaTokenLease[], StanzaTokenLease[]]>((groups, value) => {
  //     const predicateResult = isValid(value)
  //     const key = predicateResult ? 1 : 0
  //     groups[key] = groups[key] ?? []
  //     groups[key].push(value)
  //     return groups
  //   }, [[], []])
  //
  //   tokenLeases = validTokenLeases
  //   tokensUsed.push(...expiredTokenLeases)
  // }
}
