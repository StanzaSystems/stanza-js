import { type Context } from './Context'

export interface LocalStateProvider {
  setContext: (context: Context, name?: string) => void
  getContext: (name?: string) => Context | undefined
  getAllContexts: () => Context[]
}
