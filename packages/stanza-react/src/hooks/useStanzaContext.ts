import { getContextStale, type StanzaContext } from '@getstanza/browser'
import { useContext, useEffect, useState } from 'react'
import { StanzaReactContext } from '../context/StanzaContext'
import { StanzaContextName } from '../context/StanzaContextName'
import { useStanzaContextChanges } from './useStanzaContextChanges'

export const useStanzaContext = (contextName?: string): StanzaContext | undefined => {
  const providedContextName = useContext(StanzaContextName)
  const [state, setState] = useState<StanzaContext | undefined>()
  const stanzaInstance = useContext(StanzaReactContext)
  const stanzaContextChanges = useStanzaContextChanges()

  const contextChanges = stanzaInstance?.contextChanges ?? stanzaContextChanges

  if (contextChanges === undefined) {
    throw Error('Component needs to be wrapped with StanzaProvider')
  }

  const resultContextName = contextName ?? providedContextName

  if (resultContextName === undefined) {
    throw Error(
      'Component needs to be wrapped with WithStanzaContextName to use useStanzaContext without a contextName parameter')
  }

  useEffect(() => {
    state?.name !== resultContextName && setState(getContextStale(resultContextName))
  }, [state, resultContextName])

  useEffect(() => {
    return contextChanges.addChangeListener(async (context) => {
      if (context.name === resultContextName) {
        setState(context)
      }
    })
  }, [contextChanges, resultContextName])

  return state
}
