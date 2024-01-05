import { z } from 'zod';
import { Health } from './model';

const zHealth = z.union([
  z.literal('HEALTH_UNSPECIFIED'),
  z.literal(0).transform(() => 'HEALTH_UNSPECIFIED' as const),
  z.literal('HEALTH_OK'),
  z.literal(1).transform(() => 'HEALTH_OK' as const),
  z.literal('HEALTH_OVERLOAD'),
  z.literal(2).transform(() => 'HEALTH_OVERLOAD' as const),
  z.literal('HEALTH_DOWN'),
  z.literal(3).transform(() => 'HEALTH_DOWN' as const),
]);
export const stanzaGuardHealthResponse = z.object({
  health: zHealth,
});

export type StanzaGuardHealthResponse = z.infer<
  typeof stanzaGuardHealthResponse
>;

export const apiHealthToHealth = (
  apiHealth: z.infer<typeof zHealth>
): Health => {
  switch (apiHealth) {
    case 'HEALTH_UNSPECIFIED':
      return Health.Unspecified;
    case 'HEALTH_OK':
      return Health.Ok;
    case 'HEALTH_OVERLOAD':
      return Health.Overloaded;
    case 'HEALTH_DOWN':
      return Health.Down;
  }
};
