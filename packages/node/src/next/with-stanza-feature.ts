import { type NextApiHandler } from 'next'
import * as oTelApi from '@opentelemetry/api'
import { featureKey } from '../feature-key'

export const withStanzaFeature = (nextApiHandler: NextApiHandler): NextApiHandler => {
  return (req, res) => {
    const activeContext = oTelApi.context.active()

    const baggage = req.headers.baggage ?? ''
    const baggageArr = typeof baggage === 'string' ? baggage.split(';') : baggage
    const baggageObj = baggageArr.map(entry => entry.trim().split(/\s*=\s*/)).reduce<Record<string, string>>((prev, [key, value]) => {
      prev[key] = value ?? ''
      return prev
    }, {})

    return oTelApi.context.with(activeContext.setValue(featureKey, baggageObj.stanzaFeature), nextApiHandler, this, req, res)
  }
}
