export async function register () {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { init } = require('@getstanza/node')
    console.log(`Stanza URL for instrumentation: ${process.env.NEXT_PUBLIC_STANZA_API}`)
    await init({
      hubUrl: process.env.NEXT_PUBLIC_STANZA_API ?? 'https://hub.demo.getstanza.io',
      apiKey: 'valid-api-key',
      serviceName: 'DemoCommerce',
      serviceRelease: '1',
      environment: 'local'
    })
  }
}
