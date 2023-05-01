import './addInstrumentation'
import { stanzaDecorator, stanzaPriorityBoost } from '@getstanza/node'

import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
dotenv.config()

const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/ping', (req, res, next) => {
  void stanzaDecorator({
    decorator: 'Stripe_Products_API',
    priorityBoost: 2
  }).call(next)
})

app.get('/ping', (req, res) => {
  void (async () => {
    console.log('Incoming headers: ping')
    console.log(JSON.stringify(req.headers, undefined, 2))

    await stanzaPriorityBoost(-1).call(async () => {
      await fetch('http://localhost:3002/pong')
    })
    res.status(200).send('pong')
  })()
})

app.get('/pong', (req, res) => {
  console.log('Incoming headers: pong')
  console.log(JSON.stringify(req.headers, undefined, 2))
  res.status(200).send('ok')
})

app.listen(3002, () => {
  console.debug('🚀 Server ready at: http://localhost:3002')
})
