const STANZA_GUARD_STORE_SYMBOL = Symbol.for(
  '[Stanza SDK Internal] Guard store',
);

interface Guard {
  initialized: boolean;
}

interface StanzaGuardStoreGlobal {
  [STANZA_GUARD_STORE_SYMBOL]: Map<string, Guard> | undefined;
}
const stanzaGuardStoreGlobal = globalThis as unknown as StanzaGuardStoreGlobal;

export const guardStore: Map<string, Guard> = (stanzaGuardStoreGlobal[
  STANZA_GUARD_STORE_SYMBOL
] = stanzaGuardStoreGlobal[STANZA_GUARD_STORE_SYMBOL] ?? new Map());
