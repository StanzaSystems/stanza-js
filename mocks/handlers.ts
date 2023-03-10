import { rest } from 'msw'

const searchFeatureAvailable = {
  featureName: 'search',
  actionCodeEnabled: 0,
  messageEnabled: 'Search is working as expected',
  actionCodeDisabled: 2,
  messageDisabled: 'Search is unavailable right now',
  enabledPercent: 100
}
const searchFeaturePartiallyAvailable = {
  featureName: 'search',
  actionCodeEnabled: 0,
  messageEnabled: 'We are having trouble with search - please retry your request.',
  actionCodeDisabled: 2,
  messageDisabled: 'Search is unavailable right now',
  enabledPercent: 80
}
const searchFeatureUnavailable = {
  featureName: 'search',
  actionCodeEnabled: 0,
  messageEnabled: 'We are having trouble with search - please retry your request.',
  actionCodeDisabled: 2,
  messageDisabled: 'Search is totally messed up RUNNNNN!!!!!!',
  enabledPercent: 0
}
const featuresStatic = [
  {
    featureName: 'checkout',
    actionCodeEnabled: 0,
    actionCodeDisabled: 2,
    enabledPercent: 60,
    messageEnabled: 'We are having trouble with checkout - please retry your request.',
    messageDisabled: 'Checkout is unavailable right now'
  },
  {
    featureName: 'featured',
    actionCodeDisabled: 2,
    enabledPercent: 0
  },
  {
    featureName: 'shipping',
    actionCodeDisabled: 1,
    messageDisabled: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
    enabledPercent: 0
  },
  {
    featureName: 'productSummary',
    actionCodeEnabled: 0,
    enabledPercent: 100,
    messageEnabled: 'We are having intermittent issues loading product summaries'
  }
]
let count = 0
export const handlers = [
  rest.get('https://hub.dev.getstanza.dev/v1/context/browser', async (req, res, ctx) => {
    // adding artificial delay to respond
    await new Promise(resolve => setTimeout(resolve, 500))
    count++
    const features = req.url.searchParams.getAll('features')
    const environment = req.url.searchParams.get('environment')
    if (environment == null) {
      return res(
        ctx.status(400)
      )
    }
    if (count <= 2) {
      return res(
        ctx.status(200),
        ctx.set('ETag', 'eTag1'),
        ctx.json({
          featureConfigs: [searchFeatureAvailable, ...featuresStatic].filter(f => {
            return features.includes(f.featureName)
          })
        })
      )
    }
    if (count === 3) {
      return res(
        ctx.status(304),
        ctx.set('ETag', 'eTag1')
      )
    }
    if (count === 4) {
      return res(
        ctx.status(200),
        ctx.set('ETag', 'eTag2'),
        ctx.json({
          featureConfigs: [searchFeaturePartiallyAvailable, ...featuresStatic].filter(f => {
            return features.includes(f.featureName)
          })
        })
      )
    }
    if (count < 7) {
      return res(
        ctx.status(304),
        ctx.set('ETag', 'eTag2')
      )
    }
    if (count === 7) {
      return res(
        ctx.status(200),
        ctx.set('ETag', 'eTag3'),
        ctx.json({
          featureConfigs: [searchFeatureUnavailable, ...featuresStatic].filter(f => features.includes(f.featureName))
        })
      )
    }
    return res(
      ctx.status(304),
      ctx.set('ETag', 'eTag3')
    )
  })
]
