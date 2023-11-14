import { z } from 'zod';

export const stanzaValidateTokenResponse = z.object({
  valid: z.boolean().optional(),
  tokensValid: z.array(
    z.object({
      valid: z.boolean(),
      token: z.string(),
    }),
  ),
});

export type StanzaValidateTokenResponse = z.infer<
  typeof stanzaValidateTokenResponse
>;
