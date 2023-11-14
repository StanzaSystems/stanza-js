import './polyfillFetch'
import { http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { type ApiFeatureState } from '../api/featureState'
import { type ApiFeaturesResponse } from '../api/featureStateResponse'

const featuresStatic: ApiFeatureState[] = [
  {
    name: 'search',
    config: {
      messageEnabled: 'We are having trouble with search - please retry your request.',
      messageDisabled: 'Search is totally messed up RUNNNNN!!!!!!',
      enabledPercent: 0
    }
  },
  {
    name: 'featured',
    config: {
      enabledPercent: 0
    }
  },
  {
    name: 'shipping',
    config: {
      messageDisabled: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
      enabledPercent: 0
    }
  },
  {
    name: 'productSummary',
    config: {
      enabledPercent: 100,
      messageEnabled: 'We are having intermittent issues loading product summaries'
    }
  }
]

const server = setupServer(
  http.post('https://hub.dev.getstanza.dev/v1/context/browser', async ({request}) => {
    const reqJson = await request.json() as { feature: { names: string[] } }
    const features = reqJson.feature.names
    const configs: ApiFeaturesResponse = {
      featureConfigs: featuresStatic.filter(f => features.includes(f.name))
    }

    return new Response(JSON.stringify(configs), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'ETag': 'eTag1'
      }
    })
  }
))

beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }) })
afterAll(() => { server.close() })
afterEach(() => { server.resetHandlers() })
