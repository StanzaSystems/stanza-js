import { rest } from 'msw';

const searchFeatureAvailable = {
  featureName: 'search',
  messageEnabled: 'Search is working as expected',
  messageDisabled: 'Search is unavailable right now',
  enabledPercent: 100,
};
const searchFeaturePartiallyAvailable = {
  featureName: 'search',
  messageEnabled:
    'We are having trouble with search - please retry your request.',
  messageDisabled: 'Search is unavailable right now',
  enabledPercent: 80,
};
const searchFeatureUnavailable = {
  featureName: 'search',
  messageEnabled:
    'We are having trouble with search - please retry your request.',
  messageDisabled: 'Search is totally messed up RUNNNNN!!!!!!',
  enabledPercent: 0,
};
const featuresStatic = [
  {
    featureName: 'checkout',
    enabledPercent: 60,
    messageEnabled:
      'We are having trouble with checkout - please retry your request.',
    messageDisabled: 'Checkout is unavailable right now',
  },
  {
    featureName: 'featured',
    enabledPercent: 0,
  },
  {
    featureName: 'shipping',
    messageDisabled:
      'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
    enabledPercent: 0,
  },
  {
    featureName: 'productSummary',
    enabledPercent: 100,
    messageEnabled:
      'We are having intermittent issues loading product summaries',
  },
];
let count = 0;
export const handlers = [
  rest.post(
    'https://hub.dev.getstanza.dev/v1/context/browser',
    async (req, res, ctx) => {
      // adding artificial delay to respond
      await new Promise((resolve) => setTimeout(resolve, 500));
      count++;
      const reqJson = await req.json();
      const features = reqJson.feature.names;
      const environment = reqJson.feature.environment;
      if (environment == null) {
        return res(ctx.status(400));
      }
      if (count <= 2) {
        return res(
          ctx.status(200),
          ctx.set('ETag', 'eTag1'),
          ctx.json({
            featureConfigs: [searchFeatureAvailable, ...featuresStatic].filter(
              (f) => {
                return features.includes(f.featureName);
              }
            ),
          })
        );
      }
      if (count === 3) {
        return res(ctx.status(304), ctx.set('ETag', 'eTag1'));
      }
      if (count === 4) {
        return res(
          ctx.status(200),
          ctx.set('ETag', 'eTag2'),
          ctx.json({
            featureConfigs: [
              searchFeaturePartiallyAvailable,
              ...featuresStatic,
            ].filter((f) => {
              return features.includes(f.featureName);
            }),
          })
        );
      }
      if (count < 7) {
        return res(ctx.status(304), ctx.set('ETag', 'eTag2'));
      }
      if (count === 7) {
        return res(
          ctx.status(200),
          ctx.set('ETag', 'eTag3'),
          ctx.json({
            featureConfigs: [
              searchFeatureUnavailable,
              ...featuresStatic,
            ].filter((f) => features.includes(f.featureName)),
          })
        );
      }
      return res(ctx.status(304), ctx.set('ETag', 'eTag3'));
    }
  ),
];
