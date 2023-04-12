export async function register () {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { init } = require('@getstanza/node')
    await init({
      hubUrl: 'http:/localhost:9010',
      apiKey: 'valid-api-key',
      serviceName: 'DemoService',
      serviceRelease: '1',
      environment: 'local'
    })
  }
}
