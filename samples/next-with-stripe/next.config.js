// @ts-check
/** @type {import('next').NextConfig} */

const { composePlugins, withNx } = require('@nx/next');

const COOKIE_PREFIX = process.env.NODE_ENV === 'development' ? '__Dev-' : '__Host-'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    stanzaEnablementNumberCookieName: `${COOKIE_PREFIX}stanza-enablement-number`,
  },
  experimental: {
    instrumentationHook: true
  },
  transpilePackages: [
    '@getstanza/react',
    '@getstanza/next',
    '@getstanza/node'
  ],
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
    };

    return config
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
