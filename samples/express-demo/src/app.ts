
import { stanzaDecorator, StanzaDecoratorError } from '@getstanza/node'

import express, { type ErrorRequestHandler } from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import fetch from 'node-fetch'

dotenv.config()
// must come after dotenv
// eslint-disable-next-line import/first
import './addInstrumentation'

const app = express()

const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions))
app.use(express.json())

// app.use('/account', (req, res, next) => {
//   void stanzaDecorator({
//     decorator: 'github_guard'
//   }).call(next).catch(next)
// })

app.get('/account/:username', (req, res, next) => {
  void (async () => {
    await stanzaDecorator({
      decorator: 'github_guard'
    }).call(async () => {
      const { username } = req.params
      try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_PAT}`
          }
        })
        console.log(userResponse.status)
        const user = await userResponse.json()
        return res.status(200).send(user)
      } catch (e) {
        return res.status(500)
      }
    })
  })().catch(next)
})

app.get('/pong', (req, res) => {
  console.log('Incoming headers: pong')
  console.log(JSON.stringify(req.headers, undefined, 2))
  res.status(200).send('ok')
})

app.use(((err, req, res, next) => {
  if (err instanceof StanzaDecoratorError) {
    res.status(429).send('Too many requests')
  } else {
    next(err)
  }
}) satisfies ErrorRequestHandler)

app.listen(3002, () => {
  console.debug('🚀 Server ready at: http://localhost:3002')
})
