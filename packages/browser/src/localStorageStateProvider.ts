import { type Context, type LocalStateProvider, utils } from 'stanza-core'

function setContext (context: Context): void {
  const name = context.name ?? ''
  console.log(`storing ${name}`)
  localStorage.setItem(`stanza_${name}`, JSON.stringify(context))
}

function getContext (name?: string): Context | undefined {
  const context = localStorage.getItem(`stanza_${name ?? ''}`)
  if (context === null) {
    return undefined
  }
  return utils.createContextFromCacheObject(JSON.parse(context))
}

function getAllContexts (): Context[] {
  return Object.keys(localStorage).filter(x =>
    x.startsWith('stanza_')).map(c => { return utils.createContextFromCacheObject(JSON.parse(localStorage[c])) })
}

const provider: LocalStateProvider = {
  getContext,
  setContext,
  getAllContexts
}

export default provider
