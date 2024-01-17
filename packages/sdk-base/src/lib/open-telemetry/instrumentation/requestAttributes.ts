import {
  type DefaultContextAttributes,
  eventDataToDefaultContextAttributes,
} from './defaultContextAttributes';
import {
  type GuardAttributes,
  eventDataToGuardAttributes,
} from './guardAttributes';
import {
  eventDataToGuardExecutionAttributes,
  type GuardExecutionAttributes,
} from './guardExecutionAttributes';
import {
  type GuardData,
  type DefaultContextData,
  type GuardExecutionData,
} from '../../global/eventBus';

export type RequestAttributes = DefaultContextAttributes &
  GuardAttributes &
  GuardExecutionAttributes;

export const eventDataToRequestAttributes = (
  data: DefaultContextData & GuardData & GuardExecutionData
): RequestAttributes => ({
  ...eventDataToDefaultContextAttributes(data),
  ...eventDataToGuardAttributes(data),
  ...eventDataToGuardExecutionAttributes(data),
});
