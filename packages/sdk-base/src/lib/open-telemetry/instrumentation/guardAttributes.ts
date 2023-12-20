import { type Attributes } from '@opentelemetry/api';
import { type GuardData, type OptionalGuardData } from '../../../index';

export interface GuardAttributes extends Attributes {
  guard: string;
}
export const eventDataToGuardAttributes = (
  data: GuardData
): GuardAttributes => ({
  guard: data.guardName,
});
export const eventDataToOptionalGuardAttributes = (
  data: OptionalGuardData
): Partial<GuardAttributes> => ({
  guard: data.guardName,
});
