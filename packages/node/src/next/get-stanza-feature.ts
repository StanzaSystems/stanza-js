import * as oTelApi from '@opentelemetry/api'
import { featureKey } from '../feature-key'
export const getStanzaFeature = () => {
  return oTelApi.context.active().getValue(featureKey)
}
