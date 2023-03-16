import { ActionCode } from '@getstanza/browser'
import { useStanzaContext } from '@getstanza/react'
import React from 'react'

type StanzaComponentProps = React.PropsWithChildren<{
  contextName: string
  featureName: string
  removedFallback?: React.FC<{ message: string }> | React.ComponentClass<{ message: string }>
}>

const StanzaComponent: React.FC<StanzaComponentProps> = ({ children, contextName, featureName, removedFallback }) => {
  const stanzaContext = useStanzaContext(contextName)
  const feature = stanzaContext?.features[featureName]
  const contextCode = feature?.code ?? ActionCode.ENABLED

  return <>
    {contextCode.toString() !== ActionCode.DISABLED_REMOVE.toString() ? children : undefined}
    {contextCode.toString() === ActionCode.DISABLED_REMOVE.toString() && removedFallback !== undefined
      ? React.createElement(removedFallback, {
        message: feature?.message ?? ''
      })
      : undefined}
  </>
}

export default StanzaComponent
