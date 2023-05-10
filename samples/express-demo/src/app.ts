import './addInstrumentation'
import { stanzaDecorator, StanzaDecoratorError, stanzaPriorityBoost } from '@getstanza/node'

import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express'
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
  }).call(next).catch(next)
})

app.get('/ping', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: ping')
    console.log(JSON.stringify(req.headers, undefined, 2))

    await stanzaPriorityBoost(-1).call(async () => {
      await fetch('http://localhost:3002/pong')
    })
    res.status(200).send('pong')
  })().catch(next)
})

app.get('/pong', (req, res) => {
  console.log('Incoming headers: pong')
  console.log(JSON.stringify(req.headers, undefined, 2))
  res.status(200).send('ok')
})

// app.use('/aService/*', stanzaExpressDecoratorMiddleware({ decorator: 'Demo_Check_Quota_Decorator' }))
app.use('/aService/*', (req, res, next) => {
  console.log('a service data decorator')
  void stanzaDecorator({ decorator: 'Demo_Check_Quota_Decorator' }).call(next).catch(next)
})
app.use('/anotherService/*', (req, res, next) => {
  console.log('another service data decorator')
  console.log('Incoming headers decorator: another service data')
  console.log(JSON.stringify(req.headers, undefined, 2))
  void stanzaDecorator({ decorator: 'Demo_Validate_Ingress_Token_Decorator' }).call(next).catch(next)
})
app.use('/sharedService/*', (req, res, next) => {
  console.log('shared service data decorator')
  void stanzaDecorator({ decorator: 'Demo_Check_Quota_Second_Decorator' }).call(next).catch(next)
})

app.get('/aService/data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: a service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    const response = await fetch('http://localhost:3002/anotherService/data')
    if (response.status === 200) {
      const data = await response.json()
      res.status(200).json(data)
    } else if (response.status === 429) {
      res.status(429).send('Too many requests to another service')
    } else {
      throw Error('Invalid response from another service')
    }
  })().catch(next)
})

app.get('/aService/shared-data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: a service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    const response = await fetch('http://localhost:3002/sharedService/data')
    if (response.status === 200) {
      const data = await response.json()
      res.status(200).json(data)
    } else if (response.status === 429) {
      res.status(429).send('Too many requests to another service')
    } else {
      throw Error('Invalid response from another service')
    }
  })().catch(next)
})

app.get('/yetAnotherService/shared-data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: a service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    const response = await fetch('http://localhost:3002/sharedService/data')
    if (response.status === 200) {
      const data = await response.json()
      res.status(200).json(data)
    } else if (response.status === 429) {
      res.status(429).send('Too many requests to another service')
    } else {
      throw Error('Invalid response from another service')
    }
  })().catch(next)
})

app.get('/aService/simple-data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: a service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    res.status(200).json({
      data: 'simple data'
    })
  })().catch(next)
})

app.get('/anotherService/data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: another service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    res.status(200).json({
      data: 'data from another service'
    })
  })().catch(next)
})

app.get('/sharedService/data', (req, res, next) => {
  void (async () => {
    console.log('Incoming headers: shared service data')
    console.log(JSON.stringify(req.headers, undefined, 2))
    res.status(200).json({
      data: 'data from shared service'
    })
  })().catch(next)
})

app.use(((err, req, res, next) => {
  if (err instanceof StanzaDecoratorError) {
    console.log('StanzaDecoratorError', err)
    res.status(429).send('Too many requests')
  } else {
    console.log('Another error', err)
    next(err)
  }
}) satisfies ErrorRequestHandler)

app.listen(3002, () => {
  console.debug('🚀 Server ready at: http://localhost:3002')
})
