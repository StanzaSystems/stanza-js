import React, { createContext } from 'react'
import type { Context, StanzaConfig } from 'stanza-core'
import { init, context } from 'stanza-browser'

const StanzaContext = createContext<Context | undefined>(undefined)

export interface StanzaProviderProps {
  children?: React.ReactNode
  config: StanzaConfig
}

const StanzaProvider: React.FunctionComponent<StanzaProviderProps> = (props: StanzaProviderProps) => {
  const { children, config } = props
  init(config)
  return (<StanzaContext.Provider value={context}>{children}</StanzaContext.Provider>)
}

export { StanzaContext, StanzaProvider }
