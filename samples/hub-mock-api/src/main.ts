import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()

const corsOptions = {
  origin: 'http://localhost:3000'
}

app.use(cors(corsOptions))
app.use(express.json())

const featureConfigs = new Map<string, ApiFeatureState>(
  [
    {
      featureName: 'checkout',
      enabledPercent: 60,
      messageEnabled:
        'We are having trouble with checkout - please retry your request.',
      messageDisabled: 'Checkout is unavailable right now'
    },
    {
      featureName: 'featured',
      enabledPercent: 0
    },
    {
      featureName: 'shipping',
      messageDisabled:
        'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
      enabledPercent: 0
    },
    {
      featureName: 'productSummary',
      enabledPercent: 100,
      messageEnabled:
        'We are having intermittent issues loading product summaries'
    }
  ].map((f) => [f.featureName, f])
)

app.get('/ping', (req, res) => {
  console.log('Incoming headers')
  console.log(JSON.stringify(req.headers, undefined, 2))
  res.status(200).send('pong')
})

app.post('/v1/context/browser', (_req, res) => {
  res.status(200).send({
    featureConfigs: Array.from(featureConfigs.values())
  } satisfies ApiFeaturesResponse)
})

app.post('/feature', (req, res) => {
  const feature: ApiFeatureState = req.body

  console.log('updating', feature)

  featureConfigs.set(feature.featureName, feature)

  res.sendStatus(200)
})

app.delete('/feature/:featureName', (req, res) => {
  featureConfigs.delete(req.params.featureName)

  res.sendStatus(200)
})

app.listen(3001, () => {
  console.debug('🚀 Server ready at: http://localhost:3001')
})

export interface ApiFeatureState {
  featureName: string
  enabledPercent: number
  messageEnabled?: string
  messageDisabled?: string
}

export interface ApiFeaturesResponse {
  featureConfigs?: ApiFeatureState[]
}
