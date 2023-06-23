/* eslint-disable @typescript-eslint/no-misused-promises */

import { stanzaDecorator, StanzaDecoratorError } from '@getstanza/node'

import express, { type Request, type ErrorRequestHandler, type Response, type NextFunction } from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
// must come after dotenv
// eslint-disable-next-line import/first
import './addInstrumentation'

// eslint-disable-next-line import/first
import fetch from 'node-fetch'

const app = express()

const corsOptions = {
  origin: '*'
}

app.use(cors(corsOptions))
app.use(express.json())

const gitHubGuard = (req: Request, res: Response, next: NextFunction) => {
  const plan = req.get('x-user-plan')
  const priorityBoost = (plan === 'free') ? -1 : 1
  console.log(`plan ${plan} boost ${priorityBoost}`)
  void stanzaDecorator({
    decorator: 'github_guard',
    priorityBoost
  }).call(next).catch(next)
}

app.get('/account/:username', gitHubGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_PAT}`
        }
      })

      const user = await userResponse.json()
      res.status(200).send(user)
    } catch (e) {
      res.status(500)
      next()
    }
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
