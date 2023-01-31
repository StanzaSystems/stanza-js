import React, { createContext } from 'react'
import type { StanzaState, StanzaConfig } from 'stanza-core'
import { init, state } from 'stanza-browser'

const StanzaContext = createContext<StanzaState | undefined>(undefined)

export interface StanzaProviderProps {
  children?: React.ReactNode
  config: StanzaConfig
}

const StanzaProvider: React.FunctionComponent<StanzaProviderProps> = (props: StanzaProviderProps) => {
  const { children, config } = props
  init(config)
  return (<StanzaContext.Provider value={state}>{children}</StanzaContext.Provider>)
}

export { StanzaContext, StanzaProvider }
