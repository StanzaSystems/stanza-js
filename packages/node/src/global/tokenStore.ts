import { createTokenStore } from '../quota/createTokenStore'
import { type TokenStore } from '../quota/tokenStore'

const TOKEN_STORE_SYMBOL = Symbol.for('Token Store')

interface TokenStoreGlobal { [TOKEN_STORE_SYMBOL]: TokenStore | undefined }
const tokenStoreGlobal = global as unknown as TokenStoreGlobal

console.log(tokenStoreGlobal[TOKEN_STORE_SYMBOL])
export const tokenStore: TokenStore = tokenStoreGlobal[TOKEN_STORE_SYMBOL] = tokenStoreGlobal[TOKEN_STORE_SYMBOL] ?? createTokenStore()
