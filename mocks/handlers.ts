import { rest } from 'msw'

const featuresForResponses = {
  Features: [
    {
      featureName: 'search',
      actionCodeEnabled: 0,
      messageEnabled: 'We are having trouble with search - please retry your request.',
      actionCodeDisabled: 2,
      messageDisabled: 'Search is unavailable right now',
      enabledPercent: 20
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
}

export const handlers = [
  rest.get('http://localhost:3004/v1/config/browser', (req, res, ctx) => {
    const features = req.url.searchParams.getAll('feature')
    console.log(`returning features ${JSON.stringify(features)}`)
    const response = featuresForResponses.Features.filter(f => { return features.includes(f.featureName) })
    return res(
      ctx.status(200),
      ctx.json({
        Features: response
      })
    )
  })
]
