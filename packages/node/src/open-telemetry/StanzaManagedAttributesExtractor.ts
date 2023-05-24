import { type Attributes, type Context } from '@opentelemetry/api'
import { StanzaConfigEntityManager } from './StanzaConfigEntityManager'
import { type ServiceConfig } from '../hub/model'
import { type IncomingMessage } from 'http'

interface AttributesExtractor {
  extractAttributes: (context: Context, request: IncomingMessage) => Attributes
}

class NoopExtractor implements AttributesExtractor {
  extractAttributes () {
    return {}
  }
}

class StanzaAttributesExtractor implements AttributesExtractor {
  constructor (readonly traceConfig: NonNullable<ServiceConfig['config']['traceConfig']>) {
    console.log(traceConfig)
  }

  extractAttributes (context: Context, request: IncomingMessage): Attributes {
    return Object.assign({}, this.extractHeadersAttributes(context, request), this.extractParamsAttributes(context, request))
  }

  private extractHeadersAttributes (_context: Context, _request: IncomingMessage): Attributes {
    return {}
  }

  private extractParamsAttributes (_context: Context, _request: IncomingMessage): Attributes {
    return {}
  }
}
export class StanzaManagedAttributesExtractor implements AttributesExtractor {
  private readonly extractorManager = new StanzaConfigEntityManager<AttributesExtractor>(
    {
      getInitial: () => new NoopExtractor(),
      createWithServiceConfig: ({ traceConfig }) => new StanzaAttributesExtractor(traceConfig),
      cleanup: async () => {}
    })

  extractAttributes (context: Context, request: IncomingMessage): Attributes {
    return this.extractorManager.getEntity(context).extractAttributes(context, request)
  }
}
