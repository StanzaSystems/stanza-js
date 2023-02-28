import { createContext } from 'react'
import { type Context } from 'stanza-browser'

export const StanzaContext = createContext<Context | undefined>(undefined)
