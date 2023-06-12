import { type z, type ZodType } from 'zod'
import { withTimeout } from '../../utils/withTimeout'
import { fetch } from '../../fetchImplementation'
import { type HubApiPath, type HubRequest } from '../hubRequest'
import { logger } from '../../global/logger'

const HUB_REQUEST_TIMEOUT = 1000

export interface HubRequestInitOptions {
  hubUrl: string
  apiKey: string
}

export const createHubRequest = ({ apiKey, hubUrl }: HubRequestInitOptions): HubRequest => {
  return async function hubRequest<T extends ZodType> (apiPath: HubApiPath, params: { method?: string, searchParams?: Record<string, string | string[] | undefined>, body?: unknown }, validateRequest: T): Promise<z.infer<T> | null> {
    const requestUrl = new URL(`${hubUrl}/${apiPath}`)

    const { method = 'GET', searchParams = {}, body } = params

    Object.entries(searchParams)
      .map(([key, value]) => typeof (value) === 'object' ? value.map(v => [key, v] as const) : [[key, value] as const])
      .flat(1)
      .filter((entry): entry is [string, string] => {
        const [key, value] = entry
        return key !== '' && value !== undefined
      })
      .forEach(([key, value]) => {
        requestUrl.searchParams.append(key, value)
      })

    const response = await withTimeout(
      HUB_REQUEST_TIMEOUT,
      'Hub request timed out',
      fetch(requestUrl, {
        headers: {
          'X-Stanza-Key': apiKey
        },
        method,
        ...(body != null ? { body: JSON.stringify(body) } : {})
      }))

    const data = await response.json()

    const parsedResult = validateRequest.safeParse(data)

    if (!parsedResult.success) {
      logger.debug('request to hub failed %o', parsedResult)
      return null
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 200)
    })

    return parsedResult.data
  }
}
