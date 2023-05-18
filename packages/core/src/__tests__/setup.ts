import { fetch } from 'cross-fetch'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { type ApiFeatureState } from '../api/featureState'
import { type ApiFeaturesResponse } from '../api/featureStateResponse'

const featuresStatic: ApiFeatureState[] = [
  {
    name: 'search',
    config: {
      actionCodeEnabled: 0,
      messageEnabled: 'We are having trouble with search - please retry your request.',
      actionCodeDisabled: 2,
      messageDisabled: 'Search is totally messed up RUNNNNN!!!!!!',
      enabledPercent: 0
    }
  },
  {
    name: 'featured',
    config: {
      actionCodeDisabled: 2,
      enabledPercent: 0
    }
  },
  {
    name: 'shipping',
    config: {
      actionCodeDisabled: 1,
      messageDisabled: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
      enabledPercent: 0
    }
  },
  {
    name: 'productSummary',
    config: {
      actionCodeEnabled: 0,
      enabledPercent: 100,
      messageEnabled: 'We are having intermittent issues loading product summaries'
    }
  }
]

const server = setupServer(
  rest.get('https://hub.dev.getstanza.dev/v1/context/browser', async (req, res, ctx) => {
    const features = req.url.searchParams.getAll('feature.names')
    const configs: ApiFeaturesResponse = {
      featureConfigs: featuresStatic.filter(f => features.includes(f.name))
    }
    return res(ctx.status(200),
      ctx.set('ETag', 'eTag1'),
      ctx.json(configs))
  }
  ))

// Add `fetch` polyfill.
global.fetch = fetch

beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }) })
afterAll(() => { server.close() })
afterEach(() => { server.resetHandlers() })
