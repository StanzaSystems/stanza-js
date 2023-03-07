import { getContextHot, getContextStale, type StanzaContext } from '@getstanza/browser'
import { useContext, useEffect, useState } from 'react'
import { StanzaReactContext } from './context/StanzaContext'

export * from './context/StanzaContext'
export * from './context/StanzaProvider'
export * from './stanzaInstance'
export * from './createStanzaInstance'

export const useStanzaContext = (contextName: string): StanzaContext => {
  const [state, setState] = useState(getContextStale(contextName))
  const stanzaInstance = useContext(StanzaReactContext)

  if (stanzaInstance === undefined) {
    throw Error('Component needs to be wrapped with StanzaProvider')
  }

  useEffect(() => {
    void getContextHot(contextName)
  }, [])

  useEffect(() => {
    return stanzaInstance.contextChanges.addChangeListener(async () => {
      setState(getContextStale(contextName))
    })
  })

  return state
}
