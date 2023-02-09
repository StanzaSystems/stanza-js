import { type Feature } from '../models/Feature'
import { type StanzaConfig } from '../models/StanzaConfig'
import { createStanzaState, type StanzaState } from '../models/StanzaState'

export async function getRefreshStateForFeatures (group: string, stanzaConfig: StanzaConfig): Promise<StanzaState> {
  interface JSONResponse {
    Features?: Feature[]
  }
  console.log(`refresh ${group}`)
  const params = new URLSearchParams()
  const FeatureGroup = stanzaConfig.FeatureGroups.find((e) => { return e.Name === group })
  FeatureGroup?.Features?.forEach(s => { params.append('feature', s) })
  const response = await fetch(`${stanzaConfig.Url}/featureStatus?${params.toString()}`, {
    headers: {
      'x-stanza-customer-id': stanzaConfig.StanzaCustomerId
    }
  }).catch((e) => { console.log(e) })
  const data: JSONResponse = await response?.json()
  console.log(data)
  return createStanzaState(data?.Features ?? [], group)
}
