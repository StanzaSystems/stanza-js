import { type Health, type StanzaGuardHealthOptions } from './guard/model'
import { hubService } from './global/hubService'

export const stanzaGuardHealth = async (options: StanzaGuardHealthOptions): Promise<Health> => {
  return hubService.getGuardHealth(options)
}
