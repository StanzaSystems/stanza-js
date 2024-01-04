import { hubService } from './global/hubService';
import { type StanzaGuardHealthOptions } from './guard/model';

export const stanzaGuardHealth = async (options: StanzaGuardHealthOptions) => {
  return hubService.getGuardHealth(options);
};
