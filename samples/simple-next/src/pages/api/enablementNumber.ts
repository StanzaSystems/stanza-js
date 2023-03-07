import { stanzaSession } from '@getstanza/next'
import { type NextApiHandler } from 'next'

const { getEnablementNumber } = stanzaSession()

const enablementNumberHandler: NextApiHandler = async (req, res) => {
  const enablementNumber = await getEnablementNumber(req, res)
  res.status(200).json(enablementNumber)
}

export default enablementNumberHandler
