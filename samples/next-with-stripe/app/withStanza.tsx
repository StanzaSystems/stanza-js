'use client'
import { createStanzaInstance } from '@getstanza/react'
import React from 'react'
import { config } from '../stanzaConfig'

createStanzaInstance(config)

const WithStanza: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>
    {children}
  </>
}

// createStanzaInstance({
//   ...config
//   // pollDelay: loadPromise
// })

// const _initialized = false

export default WithStanza
