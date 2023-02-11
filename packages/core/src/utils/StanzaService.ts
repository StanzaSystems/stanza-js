import { type Feature } from '../models/Feature'
import globals from '../globals'

export async function getRefreshedFeatures (contextName: string): Promise<Feature[]> {
  interface JSONResponse {
    Features?: Feature[]
  }
  console.log(`refresh ${contextName}`)
  const params = new URLSearchParams()
  const featureGroup = globals.getConfig().contextConfigs.find((e) => { return e.name === contextName })
  featureGroup?.features?.forEach(s => { params.append('feature', s) })
  const response = await fetch(`${globals.getConfig().url}/featureStatus?${params.toString()}`, {
    headers: {
      'x-stanza-customer-id': globals.getConfig().stanzaCustomerId
    }
  }).catch((e) => { console.log(e) })
  const data: JSONResponse = await response?.json()
  console.log(data)
  return data?.Features ?? []
}
