import React, { useEffect, useState } from 'react'
import { StanzaBrowser } from 'stanza-browser'
import { StanzaContext } from './StanzaContext'

export interface StanzaProviderProps {
  children?: React.ReactNode
  contextName: string
}

export const StanzaProvider: React.FunctionComponent<StanzaProviderProps> = (props) => {
  const { children, contextName } = props

  const [context, setContextState] = useState(StanzaBrowser.getContextStale(contextName))

  useEffect(() => {
    return StanzaBrowser.changes.addChangeListener(async (): Promise<void> => {
      const browserContext = await StanzaBrowser.getContext(contextName)
      setContextState(browserContext)
    })
  })
  return (<StanzaContext.Provider value={context}>{children}</StanzaContext.Provider>)
}
