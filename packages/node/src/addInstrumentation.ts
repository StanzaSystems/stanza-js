export const addInstrumentation = async () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
  const { InMemorySpanExporter } = require('@opentelemetry/sdk-trace-node')

  const httpInstrumentation = new HttpInstrumentation()
  // NOTE: @opentelemetry/sdk-node needs to be required after we create the instrumentation.
  // Otherwise, the instrumentation fails to work
  const { NodeSDK } = require('@opentelemetry/sdk-node')

  /* eslint-enable @typescript-eslint/no-var-requires */
  const sdk = new NodeSDK({
    traceExporter: new InMemorySpanExporter(),
    instrumentations: [
      httpInstrumentation
      // TODO: enable when FetchInstrumentation supports Node
      // ...(typeof globalThis.fetch === 'function' ? [new FetchInstrumentation()] : [])
    ]
  })
  sdk.start()
}
export {}
