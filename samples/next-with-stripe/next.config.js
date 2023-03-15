/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
  '@getstanza/react',
  '@getstanza/next'
])

const COOKIE_PREFIX = process.env.NODE_ENV === 'development' ? '__Dev-' : '__Host-'

module.exports = withTM({
  reactStrictMode: true,
  publicRuntimeConfig: {
    stanzaEnablementNumberCookieName: `${COOKIE_PREFIX}stanza-enablement-number`,
  },
})
