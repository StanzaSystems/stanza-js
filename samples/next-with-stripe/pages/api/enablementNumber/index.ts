import appStanzaSession from '../../../utils/app-stanza-session';

const { withStanzaSession } = appStanzaSession;

export default withStanzaSession(async (req, res) => {
  res.status(200).json(req.stanzaSession.enablementNumber);
});
