// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

const COOKIE_PREFIX =
  process.env.NODE_ENV === 'development' ? '__Dev-' : '__Host-';

const rewrites = async () => {
  return [
    {
      source: '/api/hub/:path*',
      destination: 'https://hub.stanzasys.co/:path*',
    },
  ];
};

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  rewrites,
  reactStrictMode: true,
  publicRuntimeConfig: {
    stanzaEnablementNumberCookieName: `${COOKIE_PREFIX}stanza-enablement-number`,
  },
  transpilePackages: ['@getstanza/react', '@getstanza/next'],
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
