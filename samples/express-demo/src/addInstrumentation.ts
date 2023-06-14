import { init } from '@getstanza/node'

void init({
  hubUrl: process.env.STANZA_HUB_ADDRESS ?? 'https://hub.dev.getstanza.dev:9020',
  apiKey: process.env.STANZA_API_KEY,
  serviceName: process.env.STANZA_SERVICE_NAME,
  serviceRelease: process.env.STANZA_SERVICE_RELEASE,
  environment: process.env.STANZA_ENVIRONMENT,
  useRestHubApi: true,
  requestTimeout: 2000,
  skipTokenCache: true
})
