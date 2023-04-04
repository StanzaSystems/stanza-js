import { init } from '@getstanza/node'

export function register () {
  init({
    hubUrl: 'https:/testhub.getstanza.dev',
    apiKey: 'dummyApiKey',
    serviceName: 'dummyService',
    serviceRelease: '1',
    environment: 'dev'
  })
}
