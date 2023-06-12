/* eslint-disable @typescript-eslint/no-misused-promises */

import { stanzaDecorator, StanzaDecoratorError } from '@getstanza/node'

import express, { type Request, type ErrorRequestHandler, type Response, type NextFunction } from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
// must come after dotenv
// eslint-disable-next-line import/first
import './addInstrumentation'
// eslint-disable-next-line import/first
import fetch from 'node-fetch'

dotenv.config()

const app = express()

const corsOptions = {
  origin: '*'
}

let ghGuardDecorator: ReturnType<typeof stanzaDecorator>

app.use(cors(corsOptions))
app.use(express.json())

app.use('/account/:username', (req: Request, res: Response, next: NextFunction) => {
  // const plan = req.get('x-user-plan')
  // const priorityBoost = (plan === 'free') ? -1 : (plan === 'enterprise') ? 1 : 0
  ghGuardDecorator = ghGuardDecorator ?? stanzaDecorator({
    decorator: 'github_guard'
    // priorityBoost,
  })

  void ghGuardDecorator.call(next).catch(next)
})

app.get('/account/:username', async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params
  try {
    // const userResponse = await fetch(`https://api.github.com/users/${username}`, {
    //   headers: process?.env.GITHUB_PAT
    //     ? {
    //         Authorization: `Bearer ${process.env.GITHUB_PAT}`
    //       }
    //     : {}
    // })
    //
    // const user = await userResponse.json()
    const user = { name: 'ktrz' }
    res.status(200).send(user)
  } catch (e) {
    res.status(500)
    next()
  }
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
