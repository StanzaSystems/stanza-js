import * as oTelApi from '@opentelemetry/api'

export const init = () => {
  console.log('init called')
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncLocalStorageContextManager = require('@opentelemetry/context-async-hooks').AsyncLocalStorageContextManager
    const contextManager = new AsyncLocalStorageContextManager()
    contextManager.enable()
    oTelApi.context.setGlobalContextManager(contextManager)
  }
}
