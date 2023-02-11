import { type LocalStateProvider } from '../models/LocalStateProvider'
import { type Context } from '../models/Context'

const localState = new Map<string, Context>()

function setContext (context: Context, name?: string): void {
  name = name ?? ''
  localState.set(name, context)
}

function getContext (name?: string): Context | undefined {
  return localState.get(name ?? '')
}

const provider: LocalStateProvider = {
  getContext,
  setContext
}

export default provider
