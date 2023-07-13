import { init } from '@getstanza/node'

init({
  hubUrl: process.env.STANZA_HUB_ADDRESS,
  apiKey: process.env.STANZA_API_KEY,
  serviceName: process.env.STANZA_SERVICE_NAME,
  serviceRelease: process.env.STANZA_SERVICE_RELEASE,
  environment: process.env.STANZA_ENVIRONMENT,
  requestTimeout: 2000,
  skipTokenCache: true
}).catch(() => {})
