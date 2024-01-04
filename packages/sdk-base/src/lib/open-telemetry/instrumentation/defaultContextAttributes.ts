import { type Attributes } from '@opentelemetry/api';
import { type DefaultContextData } from '../../global/eventBus';

export interface DefaultContextAttributes extends Attributes {
  service: string;
  environment: string;
  client_id: string;
  customer_id?: string;
}
export const eventDataToDefaultContextAttributes = (
  data: DefaultContextData
): DefaultContextAttributes => ({
  service: data.serviceName,
  environment: data.environment,
  client_id: data.clientId,
  customer_id: data.customerId,
});
