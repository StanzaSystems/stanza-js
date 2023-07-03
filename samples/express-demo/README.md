## Express demo app

An extremely simple demo app that illustrates how Stanza can be used to rate limit a service's incoming requests.

## Setup

1. Copy the `.env.sample` environment variables into a local `.env` file.
2. In the `.env` file, set `STANZA_API_KEY` to a [browser key](https://ui.demo.getstanza.io/admin?tab=keys) for your local environment.
3. In the `.env` file, set `GITHUB_PAT` to a [GitHub Personal Access Token](https://github.com/settings/tokens).  It does not require any particular scopes.
4. In the [Stanza UI](https://ui.demo.getstanza.io/decorators), create a decorator:

  | Name                | Project | Environment | Traffic Type |
  |---------------------|---------|-------------|--------------|
  | github_guard        | default | local       | Outbound     |

Ensure the decorator has the following traffic configuration:

```json
{
  "quotaConfig": {
    "burst": 2,
    "enabled": true,
    "refillRate": 1,
    "strictSynchronous": false
  }
}
```

Note that this configuration is useful for demonstration purposes only.  In a real application, the refill and burst rates would be much higher.

### Traffic Configuration Options

#### `enabled`

Boolean value that determines whether the decorator is enabled.

- When enabled, traffic flowing through this decorator is guarded based on the active configuration.
- When disabled, all traffic is allowed to flow through the decorator without being guarded - as if the decorator were not there.

#### `refillRate`

The rate that the decorator is refilled, in terms of calls per second.

For example, if the decorator is guarding a function that makes an outbound query to another service, the refill rate controls
the maximum number of queries per second allowed to access the service through that function.

#### `burst`

The number of calls per second that are allowed to exceed the refill rate.

_TODO: Explain this better._

#### `strictSynchronous`

_TODO: Explain what this does._

## Starting the Express Demo

First be sure that you have run `npm install` from the repository root at least once, per the Getting Started section of the [root readme](../../README.md).

Then, you can either run `npx nx serve express-demo` from the repository root, or just `npx nx serve` from the `samples/express-demo` directory.

**Important:** Wait for the message `🚀 Server ready at: http://localhost:3002` before proceeding.

## Using the Express Demo

In the following examples, [octocat](https://github.com/octocat) is a GitHub username that is commonly used for testing. You can use this, or replace it with any valid GitHub username.
The demo app will make a request to a GitHub API that retrieves details for that user.

For regular priority (using the default plan):
```sh
curl localhost:3002/account/octocat
```

For low priority (using the "free" plan):
```sh
curl --header "x-user-plan: free" localhost:3002/account/octocat
```

For high priority (using the "enterprise" plan):
```sh
curl --header "x-user-plan: enterprise" localhost:3002/account/octocat
```

## Load Testing

To better understand the benefit of using Stanza, make sure the demo app has been started and then run a load test (from the `samples/express-demo` directory).

```sh
npm run loadTest
```

This will use [Artillery](https://www.artillery.io/) to send randomized requests to the demo app.

_Note: The first time you run this, there may be a delay while Artillery is installed._

You'll see Artillery's statistics along the way, and a summary output at the end, such as the following:

```
┌─────────┬──────────────┬───────┬─────────┬─────────┬────────────┐
│ (index) │     type     │ total │ success │ limited │ successPct │
├─────────┼──────────────┼───────┼─────────┼─────────┼────────────┤
│    0    │ 'enterprise' │  54   │   30    │   24    │     56     │
│    1    │    'pro'     │  47   │    4    │   43    │     9      │
│    2    │    'free'    │  59   │    3    │   56    │     5      │
└─────────┴──────────────┴───────┴─────────┴─────────┴────────────┘
```

From this chart, you can see the total number of requests of each type that were sent, how many succeeded, how many were rate limited, and the percent that were successful.
Because we set the refill and burst rates very low, we should see a majority of requests were rate-limited.  However, we can also see that higher priority requests from users
of the `enterprise` plan were allowed to succeed at a much higher rate than users of the default `pro` plan, or users of the `free` plan.

For this example, these plans and their priorities were established in the source code of the `gitHubGuard`
function in [`main.ts`](./src/main.ts).

```ts
const priorityBoost = (plan === 'free') ? -1 : (plan === 'enterprise') ? 1 : 0
```
