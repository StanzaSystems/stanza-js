import { stanzaSession } from '@getstanza/next'

const { withStanzaSession } = stanzaSession()

export default withStanzaSession(async (req, res) => {
  res.status(200).json(req.stanzaSession.enablementNumber)
})
