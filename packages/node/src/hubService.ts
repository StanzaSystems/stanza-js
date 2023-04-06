import { z } from 'zod'

const HUB_REQUEST_TIMEOUT = 1000

const zService = z.object({
  name: z.string(),
  environment: z.string(),
  release: z.string(),
  tags: z.array(z.object({ key: z.string(), value: z.string() }))
})
const zNonStrictObject = z.object({}).nonstrict()
const zTraceConfig = z.object({
  collectorUrl: z.string(),
  collectorKey: z.string(),
  sampleRateDefault: z.number(),
  overrides: z.array(zNonStrictObject)
})
const zMetricConfig = z.object({
  collectorUrl: z.string(),
  collectorKey: z.string()
})
const zSentinelConfig = z.object({
  circuitbreakerRulesJson: z.string(),
  flowRulesJson: z.string(),
  isolationRulesJson: z.string(),
  systemRulesJson: z.string()
})
const serviceConfigNoData = z.object({
  version: z.string(),
  configDataSent: z.literal(false),
  config: z.null().optional()
})

const serviceConfigWithData = z.object({
  version: z.string(),
  configDataSent: z.literal(true),
  config: z.object({
    service: zService,
    traceConfig: zTraceConfig,
    metricConfig: zMetricConfig,
    sentinelConfig: zSentinelConfig
  })
})
const serviceConfig = z.union(
  [serviceConfigWithData, serviceConfigNoData]
)

export type ServiceConfigResult = z.infer<typeof serviceConfig>

export type ServiceConfig = Pick<ServiceConfigResult, 'version' | 'config'>

export const createHubService = (hubUrl: string, apiKey: string) => ({
  fetchServiceConfig: async ({ serviceName, serviceRelease, environment, lastVersionSeen }: {
    serviceName: string
    serviceRelease: string
    environment: string
    lastVersionSeen?: string
  }): Promise<ServiceConfig | null> => {
    const requestUrl = new URL(`${hubUrl}/v1/config/service`)
    requestUrl.searchParams.append('service.name', serviceName)
    requestUrl.searchParams.append('service.release', serviceRelease)
    requestUrl.searchParams.append('service.environment', environment)
    lastVersionSeen !== undefined && requestUrl.searchParams.append('versionSeen', lastVersionSeen)

    const response = await Promise.race([
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey
        }
      }),
      new Promise<Promise<Response>>((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Hub request timed out'))
        }, HUB_REQUEST_TIMEOUT)
      })
    ])

    const data = await response.json()

    const serviceConfigResult = serviceConfig.safeParse(data)

    if (!serviceConfigResult.success) {
      return null
    }
    if (!serviceConfigResult.data.configDataSent) {
      return null
    }

    const serviceConfigData = serviceConfigResult.data

    return {
      config: serviceConfigData.config,
      version: serviceConfigData.version
    }
  }
})
