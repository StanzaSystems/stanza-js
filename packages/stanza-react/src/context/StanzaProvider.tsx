import React from 'react'
import { type StanzaInstance } from '../stanzaInstance'
import { StanzaReactContext } from './StanzaContext'

export interface StanzaProviderProps {
  children?: React.ReactNode
  instance: StanzaInstance
}

export const StanzaProvider: React.FC<StanzaProviderProps> = (props) => {
  const { children, instance } = props

  return (
    <StanzaReactContext.Provider value={instance}>
      {children}
    </StanzaReactContext.Provider>
  )
}
