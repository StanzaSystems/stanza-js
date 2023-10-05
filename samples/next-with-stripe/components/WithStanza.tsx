'use client'
import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import React from 'react'
import { browserConfig } from '../stanzaConfig'

const stanzaInstance = createStanzaInstance(browserConfig)

const WithStanza: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <StanzaProvider instance={stanzaInstance}>
    {children}
  </StanzaProvider>
}

export default WithStanza
