# Stanza Example using Stripe with TypeScript and react-stripe-js
## This Sample is adapted from the official [Next.js + Stripe Sample](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)

This is a full-stack TypeScript example using:

- Frontend:
  - Next.js and [SWR](https://github.com/vercel/swr)
  - [react-stripe-js](https://github.com/stripe/react-stripe-js) for [Checkout](https://stripe.com/checkout) and [Elements](https://stripe.com/elements)
  - Stanza UI Toolkit
- Backend
  - Next.js [API routes](https://nextjs.org/docs/api-routes/introduction)
  - [stripe-node with TypeScript](https://github.com/stripe/stripe-node#usage-with-typescript)
  - Stanza for Next.js

## Demo

- Live demo: https://testapp.demo.getstanza.io/


## Local Set-Up

### Stanza Configuration:

 1. Create an environment called 'local' in Stanza, if it does not exist
 2. Create three [features](https://ui.demo.getstanza.io/features) (match case)

  | Name     | Project | Environment | Priority |
  |----------|---------|-------------|----------|
  | checkout | default | local       | 0        |
  | search   | default | local       | 1        |
  | featured | default | local       | 2        |

 3. Create a [guard](https://ui.demo.getstanza.io/guards) to guard the products API (match case)

  | Name                | Project | Environment | Traffic Type |
  |---------------------|---------|-------------|--------------|
  | Stripe_Products_API | default | local       | Outbound     |

 4. On creation you will be redirected to the guard details page. From there, ensure the traffic configuration JSON is as follows:

 ```json
{
  "quotaConfig": {
    "burst": 10,
    "enabled": true,
    "refillRate": 10,
    "strictSynchronous": false
  }
}
 ```

### Environment Configuration:
Make an account in the [stripe dashboard](https://dashboard.stripe.com).

Set the following in your .env file (copy from stripe and stanza dashboards)
```
# Stripe keys
# https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={{your publishable key}}
STRIPE_SECRET_KEY={{your secret key}}
STRIPE_PAYMENT_DESCRIPTION='Cool robot swag'
# https://stripe.com/docs/webhooks/signatures
STRIPE_WEBHOOK_SECRET={{ your webook secret}}

# Stanza Specific Browser Key https://ui.demo.getstanza.io/keys
NEXT_PUBLIC_STANZA_BROWSER_KEY= {{your stanza key for local environment}}
```

### Running the App

```
npm install (from root of repository)

npx nx serve next-with-stripe (from root of repository)
```

The app will run on `localhost:4200` by default.

### Running Load Tests

Stanza responds to load by rate limiting requests in a prioritized way. To see stanza rate limit requests while your app is running, open a separate terminal and run

```
npx artillery run ./load-test.yml (from this directory)
```
