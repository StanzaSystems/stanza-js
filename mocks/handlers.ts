import { rest } from 'msw'

const featuresForResponses = {
  Features: [
    {
      Name: 'search',
      Status: 'DEGRADED_ERROR',
      ErrorMessage: 'We are having trouble with search - please retry your request.'
    },
    {
      Name: 'featured',
      Status: 'OUTAGE_REMOVE'
    },
    {
      Name: 'shipping',
      Status: 'OUTAGE_ERROR',
      ErrorMessage: 'We are unable to pre-load shipping costs right now, but if you continue your order will still process'
    },
    {
      Name: 'productSummary',
      Status: 'DEGRADED_NO_ERROR'
    }
  ]
}

export const handlers = [
  rest.get('http://localhost:3004/featureStatus', (req, res, ctx) => {
    const features = req.url.searchParams.getAll('feature')
    console.log(`returning features ${JSON.stringify(features)}`)
    const response = featuresForResponses.Features.filter(f => { return features.includes(f.Name) })
    return res(
      ctx.status(200),
      ctx.json({
        Features: response
      })
    )
  })
]
