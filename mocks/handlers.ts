import { rest } from 'msw'

const featuresForResponses = {
  Features: [
    {
      name: 'search',
      code: 'DEGRADED_ERROR',
      message: 'We are having trouble with search - please retry your request.'
    },
    {
      name: 'featured',
      code: 'OUTAGE_REMOVE'
    },
    {
      name: 'shipping',
      code: 'OUTAGE_ERROR',
      message: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process'
    },
    {
      name: 'productSummary',
      code: 'DEGRADED_NO_ERROR'
    }
  ]
}

export const handlers = [
  rest.get('http://localhost:3004/featureStatus', (req, res, ctx) => {
    const features = req.url.searchParams.getAll('feature')
    console.log(`returning features ${JSON.stringify(features)}`)
    const response = featuresForResponses.Features.filter(f => { return features.includes(f.name) })
    return res(
      ctx.status(200),
      ctx.json({
        Features: response
      })
    )
  })
]
