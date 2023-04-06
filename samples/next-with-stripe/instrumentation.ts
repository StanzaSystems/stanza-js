
export async function register () {
  if (typeof window !== 'undefined') {
    return
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    return
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { init } = require('@getstanza/node')
    await init({
      hubUrl: 'http:/localhost:9010',
      apiKey: 'valid-api-key',
      serviceName: 'DemoService',
      serviceRelease: '1',
      environment: 'local'
    })
  } catch (e) {
    console.error('failed', e)
  }
}
