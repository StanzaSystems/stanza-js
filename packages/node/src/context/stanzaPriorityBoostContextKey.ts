import * as oTelApi from '@opentelemetry/api'

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  let stanzaPriorityBoostContextKey: symbol | undefined
}

export const stanzaPriorityBoostContextKey = global.stanzaPriorityBoostContextKey = global.stanzaPriorityBoostContextKey ?? oTelApi.createContextKey(
  'Stanza Priority Boost')
