import { type TokenQuery } from './tokenState'
import { type StanzaToken } from '../hub/model'

export interface TokenStoreQuery extends TokenQuery {
  decorator: string
}

export interface TokenStore {
  getToken: (query: TokenStoreQuery) => Promise<StanzaToken | null>
  markTokenAsConsumed: (token: string) => void
}
