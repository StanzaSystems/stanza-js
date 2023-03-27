export const init = () => {
  if (typeof window === 'undefined') {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
    // TODO: enable when Fetch instrumentation supports Node
    // const { FetchInstrumentation } = require('@opentelemetry/instrumentation-fetch')
    const httpInstrumentation = new HttpInstrumentation()

    const { NodeSDK } = require('@opentelemetry/sdk-node')
    const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node')
    const sdk = new NodeSDK({
      traceExporter: new ConsoleSpanExporter(),
      instrumentations: [
        httpInstrumentation
        // TODO: enable when FetchInstrumentation supports Node
        // ...(typeof globalThis.fetch === 'function' ? [new FetchInstrumentation()] : [])
      ]
    })
    sdk.start()
  }
}
