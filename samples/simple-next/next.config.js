/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
  '@getstanza/react',
  '@getstanza/next'
])

const COOKIE_PREFIX = process.env.NODE_ENV === 'development' ? '__Dev-' : '__Host-'

const rewrites = () => {
  return {
    fallback: [
      {
        source: '/api/hub/:path*',
        destination: 'https://hub.dev.getstanza.dev/:path*',
      },
    ]
  }
}

module.exports = withTM({
  rewrites,
  reactStrictMode: true,
  publicRuntimeConfig: {
    stanzaEnablementNumberCookieName: `${COOKIE_PREFIX}stanza-enablement-number`,
  },
})
