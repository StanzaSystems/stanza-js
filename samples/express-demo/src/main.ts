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

async function getGitHubProfile (username: string) {
  const userResponse = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_PAT}`
    }
  })
  const user = await userResponse.json()
  return user
}

const getGitHubProfilePaid = stanzaDecorator({
  decorator: 'github_guard',
  priorityBoost: 0
}).bind(getGitHubProfile)

const getGitHubProfileFree = stanzaDecorator({
  decorator: 'github_guard',
  priorityBoost: -1
}).bind(getGitHubProfile)

app.get('/account/:username', async (req: Request, res: Response, next: NextFunction) => {
  const plan = req.get('x-user-plan')
  const { username } = req.params
  try {
    const user = (plan === 'free') ? await getGitHubProfileFree(username) : await getGitHubProfilePaid(username)
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

app.listen(3003, () => {
  console.debug('🚀 Server ready at: http://localhost:3002')
})
