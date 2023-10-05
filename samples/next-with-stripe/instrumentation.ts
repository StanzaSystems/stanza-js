export async function register () {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@getstanza/node')
    const { nodeConfig } = await import('./stanzaConfig')

    console.log(`Stanza URL for instrumentation: ${nodeConfig.hubUrl}`)
    await init(nodeConfig)
  }
}
