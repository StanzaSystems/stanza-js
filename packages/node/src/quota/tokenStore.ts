import { type TokenQuery } from './tokenState'

// type DecoratorName = string

// responsible for fetching tokens
export interface TokenStoreQuery extends TokenQuery {
  decorator: string
}

export interface TokenStore {
  // private props
  // decoratorState: Record<DecoratorName, TokenState>

  // methods
  getToken: (query: TokenStoreQuery) => Promise<string | null>
  markTokenAsConsumed: (token: string) => void
}
