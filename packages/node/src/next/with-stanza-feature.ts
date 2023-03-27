import { type NextApiHandler } from 'next'
import * as oTelApi from '@opentelemetry/api'
import { featureKey } from '../feature-key'

export const withStanzaFeature = (nextApiHandler: NextApiHandler): NextApiHandler => {
  return (req, res) => {
    const activeContext = oTelApi.context.active()

    const stanzaFeature = oTelApi.propagation.getActiveBaggage()?.getEntry('stanzaFeature')?.value

    return oTelApi.context.with(activeContext.setValue(featureKey, stanzaFeature), nextApiHandler, this, req, res)
  }
}
