const key = process.env.NEXT_PUBLIC_STANZA_BROWSER_KEY

if (typeof key !== 'string') {
  throw new Error('NEXT_PUBLIC_STANZA_BROWSER_KEY is a required environment variable')
}

export async function register () {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { init } = require('@getstanza/node')
    console.log(`Stanza URL for instrumentation: ${process.env.NEXT_PUBLIC_STANZA_API}`)
    await init({
      hubUrl: (process.env.NEXT_PUBLIC_STANZA_API ?? 'https://hub.demo.getstanza.io'),
      apiKey: key,
      serviceName: 'DemoCommerce',
      serviceRelease: '1',
      environment: process.env.NEXT_PUBLIC_STANZA_ENVIRONMENT ?? 'local',
      useRestHubApi: true
    })
  }
}
