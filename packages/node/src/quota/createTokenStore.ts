import { type TokenStore } from './tokenStore'
import { hubService } from '../global/hubService'
import { createTokenState } from './createTokenState'

export const createTokenStore = (): TokenStore => {
  const state = createTokenState()
  // let getTokenLeaseInProgress: Promise<void> | undefined

  return {
    getToken: async (query) => {
      if (state.hasToken(query)) {
        return state.popToken(query)?.token ?? null
      }

      // if (getTokenLeaseInProgress === undefined) {
      //   getTokenLeaseInProgress = hubService.getTokenLease({
      //     ...query
      //   }).then(tokenLeases => {
      //     if (tokenLeases !== null) {
      //       state.addTokens(tokenLeases)
      //     }
      //   })
      //
      //   await getTokenLeaseInProgress
      //
      //   return state.popToken(query)?.token ?? null
      // }

      const tokenLeases = await hubService.getTokenLease({
        ...query
      })

      if (tokenLeases !== null) {
        state.addTokens(tokenLeases)
        return state.popToken(query)?.token ?? null
      }

      return null
    },
    markTokenAsConsumed: () => {}
  }
}
