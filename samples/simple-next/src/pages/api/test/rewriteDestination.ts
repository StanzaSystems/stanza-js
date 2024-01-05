import { type NextApiHandler } from 'next';

const handler: NextApiHandler = (req, res) => {
  console.log('rewriteDestinationHandler');
  console.log('handler url:', req.url);
  console.log('handler req headers:', req.headers);
  console.log('handler res headers:', res.getHeaders());

  res.status(200).send('ok');
};

export default handler;
