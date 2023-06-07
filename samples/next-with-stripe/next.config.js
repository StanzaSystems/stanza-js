// @ts-check
/** @type {import('next').NextConfig} */

const { composePlugins, withNx } = require('@nx/next');

const COOKIE_PREFIX = process.env.NODE_ENV === 'development' ? '__Dev-' : '__Host-'

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

/**
 * @param {import('next').NextConfig} config
 * @return {any}
 */
const withSentryConfigPlugin = (config) => withSentryConfig(
  config,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "stanza",
    project: "stanza-next-commerce-demo",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);

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
  withSentryConfigPlugin
];

module.exports = composePlugins(...plugins)(nextConfig);
