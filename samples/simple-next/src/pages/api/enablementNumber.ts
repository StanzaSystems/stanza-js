import { stanzaSession } from '@getstanza/next';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const { withStanzaSession } = stanzaSession({
  name: publicRuntimeConfig.stanzaEnablementNumberCookieName,
});

export default withStanzaSession(async (req, res) => {
  res.status(200).json(req.stanzaSession.enablementNumber);
});
