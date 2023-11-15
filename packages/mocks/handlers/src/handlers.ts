import { HttpResponse, http } from 'msw';

interface FeatureRequest {
  feature: {
    names: string[];
    environment: string;
  };
}

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
  http.post(
    'https://hub.dev.getstanza.dev/v1/context/browser',
    async ({ request }) => {
      // adding artificial delay to respond
      await new Promise((resolve) => setTimeout(resolve, 500));
      count++;
      const reqJson = (await request.json()) as FeatureRequest;
      const features = reqJson.feature.names;
      const environment = reqJson.feature.environment;
      if (environment == null) {
        return new HttpResponse(null, {
          status: 400,
        });
      }
      if (count <= 2) {
        return HttpResponse.json(
          {
            featureConfigs: [searchFeatureAvailable, ...featuresStatic].filter(
              (f) => {
                return features.includes(f.featureName);
              }
            ),
          },
          {
            status: 200,
            headers: {
              ETag: 'eTag1',
            },
          }
        );
      }
      if (count === 3) {
        return new HttpResponse(null, {
          status: 304,
          headers: {
            ETag: 'eTag1',
          },
        });
      }
      if (count === 4) {
        return HttpResponse.json(
          {
            featureConfigs: [searchFeatureAvailable, ...featuresStatic].filter(
              (f) => {
                return features.includes(f.featureName);
              }
            ),
          },
          {
            status: 200,
            headers: {
              ETag: 'eTag1',
            },
          }
        );
      }
      if (count < 7) {
        return new HttpResponse(null, {
          status: 304,
          headers: {
            ETag: 'eTag2',
          },
        });
      }
      if (count === 7) {
        return HttpResponse.json(
          {
            featureConfigs: [
              searchFeaturePartiallyAvailable,
              ...featuresStatic,
            ].filter((f) => features.includes(f.featureName)),
          },
          {
            status: 200,
            headers: {
              ETag: 'eTag3',
            },
          }
        );
      }
      return new HttpResponse(null, {
        status: 304,
        headers: {
          ETag: 'eTag3',
        },
      });
    }
  ),
];
