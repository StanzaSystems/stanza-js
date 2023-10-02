'use client'
import { createStanzaInstance, StanzaProvider } from '@getstanza/react'
import { config } from '../stanzaConfig'
import React from 'react'

const stanzaInstance = createStanzaInstance({
  ...config
  // pollDelay: loadPromise
})

const Foo: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <StanzaProvider instance={ stanzaInstance }>
    {children}
  </StanzaProvider>
}

export default Foo
