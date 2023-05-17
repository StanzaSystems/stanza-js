import { type Attributes } from '@opentelemetry/api'

export interface DefaultContextAttributes extends Attributes {
  service: string
  environment: string
  client_id: string
}
export const eventDataToDefaultContextAttributes = (data: any): DefaultContextAttributes => ({
  service: data.serviceName,
  environment: data.environment,
  client_id: data.clientId
})
