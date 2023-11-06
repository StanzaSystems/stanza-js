'use client'
import React, { type PropsWithChildren } from 'react'
import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import { browserConfig } from '../stanzaConfig'

const stanzaInstance = createStanzaInstance(browserConfig)

const WithStanza: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <StanzaProvider instance={stanzaInstance}>
      {children}
    </StanzaProvider>
  )
}

export default WithStanza
