import { init } from '@getstanza/node'

void init({
  hubUrl: 'https://hub.dev.getstanza.dev:9010',
  apiKey: 'valid-api-key',
  serviceName: 'DemoCommerce',
  serviceRelease: '1',
  environment: 'local',
  useRestHubApi: true
})
