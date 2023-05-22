import { type DecoratorConfig } from '../hub/model'
import { startPolling } from '../utils/startPolling'
import { fetchDecoratorConfig } from './fetchDecoratorConfig'

export const startPollingDecoratorConfig = (decorator: string) => {
  startPolling(async (prevResult: DecoratorConfig | null) => fetchDecoratorConfig({
    decorator,
    lastVersionSeen: prevResult?.version
  }), { pollInterval: 15000 })
}
