import { z } from 'zod';

export const stanzaMarkTokensAsConsumedResponse = z.object({});

export type StanzaMarkTokensAsConsumedResponse = z.infer<
  typeof stanzaMarkTokensAsConsumedResponse
>;
