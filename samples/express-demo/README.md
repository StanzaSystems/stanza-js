## Express demo app

An extremely simple demo app that illustrates how Stanza can be used to rate limit a service's incoming requests.

## Setup

1. Copy the sample environment variables into a local .env.
2. In the .env file, set `STANZA_API_KEY` to a [browser key](https://ui.demo.getstanza.io/admin?tab=keys) for your local environment.
3. In the .env file, set `GITHUB_PAT` to a [GitHub Personal Access Token](https://github.com/settings/tokens)
4. In the [Stanza UI](https://ui.demo.getstanza.io/decorators), create a decorator:

  | Name                | Project | Environment | Traffic Type |
  |---------------------|---------|-------------|--------------|
  | github_guard | default | local       | Outbound     |

Ensure the decorator has the following configuration:
```
{
  "quotaConfig": {
    "burst": 2,
    "enabled": true,
    "refillRate": 1,
    "strictSynchronous": false
  }
}
```
Then run:
```
npm install
npm run dev
```

## To call
```
curl localhost:3002/account/maggiepint
```

## To run load test
```
npx artillery run ./load-test.yml
```