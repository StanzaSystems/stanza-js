import { type Attributes } from '@opentelemetry/api';
import { type GuardExecutionData } from '../../global/eventBus';

export interface GuardExecutionAttributes extends Attributes {
  feature: string;
  priority_boost: number;
}

export const eventDataToGuardExecutionAttributes = (
  data: GuardExecutionData
): GuardExecutionAttributes => ({
  feature: data.featureName,
  priority_boost: data.priorityBoost,
});
