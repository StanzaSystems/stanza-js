import React, { createContext } from 'react'
import type { Context, StanzaConfig } from 'stanza-core'
import { init } from 'stanza-browser'

const StanzaContext = createContext<Context | undefined>(undefined)

export interface StanzaProviderProps {
  children?: React.ReactNode
  config: StanzaConfig
}

const StanzaProvider: React.FunctionComponent<StanzaProviderProps> = (props: StanzaProviderProps) => {
  const { children, config } = props
  init(config)
  // TODO: we need to provide a real context value here when we decide on the API
  return (<StanzaContext.Provider value={undefined}>{children}</StanzaContext.Provider>)
}

export { StanzaContext, StanzaProvider }
