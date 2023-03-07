import { stanzaSession } from '@getstanza/next'
import { type NextApiHandler } from 'next'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const { getEnablementNumber } = stanzaSession({
  name: publicRuntimeConfig.stanzaEnablementNumberCookieName
})

const enablementNumberHandler: NextApiHandler = async (req, res) => {
  const enablementNumber = await getEnablementNumber(req, res)
  res.status(200).json(enablementNumber)
}

export default enablementNumberHandler
