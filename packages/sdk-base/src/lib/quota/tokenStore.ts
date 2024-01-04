import { type TokenQuery } from './tokenState';
import { type StanzaToken } from '@getstanza/hub-client-api';

export interface TokenStoreQuery extends TokenQuery {
  guard: string;
}

export interface TokenStore {
  getToken: (query: TokenStoreQuery) => Promise<StanzaToken | null>;
  markTokenAsConsumed: (token: string) => void;
}
