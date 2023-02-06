import { rest } from 'msw'

const featuresForResponses = {
  Features: [
    {
      Name: 'search',
      Status: 'DEGRADED_ERROR',
      ErrorMessage: 'We are having trouble with search - please retry your request!!!!!!'
    },
    {
      Name: 'featured',
      Status: 'OUTAGE_REMOVE'
    },
    {
      Name: 'shipping',
      Status: 'OUTAGE_ERROR',
      ErrorMessage: 'We are having trouble loading the graph UI right now - please retry your request!!!!!!'
    },
    {
      Name: 'productSummary',
      Status: 'DEGRADED_NO_ERROR'
    }
  ]
}

export const handlers = [
  rest.get('*/featureStatus', (req, res, ctx) => {
    const features = req.url.searchParams.getAll('feature')
    const response = featuresForResponses.Features.filter(f => { return features.includes(f.Name) })
    return res(
      ctx.status(200),
      ctx.json({
        Features: response
      })
    )
  })
]
