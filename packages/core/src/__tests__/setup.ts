import './polyfillFetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { type SpyInstance } from 'vitest';
import { type ApiFeatureState } from '../api/featureState';
import { type ApiFeaturesResponse } from '../api/featureStateResponse';

const featuresStatic: ApiFeatureState[] = [
  {
    name: 'search',
    config: {
      messageEnabled:
        'We are having trouble with search - please retry your request.',
      messageDisabled: 'Search is totally messed up RUNNNNN!!!!!!',
      enabledPercent: 0,
    },
  },
  {
    name: 'featured',
    config: {
      enabledPercent: 0,
    },
  },
  {
    name: 'shipping',
    config: {
      messageDisabled:
        'We are unable to pre-load shipping costs right now, but if you continue your order will still process',
      enabledPercent: 0,
    },
  },
  {
    name: 'productSummary',
    config: {
      enabledPercent: 100,
      messageEnabled:
        'We are having intermittent issues loading product summaries',
    },
  },
];

const server = setupServer(
  rest.post('https://url.to.hub/v1/context/browser', async (req, res, ctx) => {
    const reqJson = await req.json();
    const features = reqJson.feature.names;
    const configs: ApiFeaturesResponse = {
      featureConfigs: featuresStatic.filter((f) => features.includes(f.name)),
    };
    return res(ctx.status(200), ctx.set('ETag', 'eTag1'), ctx.json(configs));
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});

let errorSpy: SpyInstance | undefined;
let warnSpy: SpyInstance | undefined;

beforeEach(() => {
  errorSpy?.mockReset();
  warnSpy?.mockReset();
  errorSpy = vi.spyOn(console, 'error');
  warnSpy = vi.spyOn(console, 'warn');
});

afterEach(() => {
  expect(errorSpy).not.toHaveBeenCalled();
  if (warnSpy?.mock.calls.length !== 0) {
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      'FakeTimers: clearTimeout was invoked to clear a native timer instead of one created by this library.\nTo automatically clean-up native timers, use `shouldClearNativeTimers`.'
    );
  } else {
    expect(warnSpy).not.toHaveBeenCalled();
  }
});
