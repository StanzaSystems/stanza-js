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

 3. Create a [decorator](https://ui.demo.getstanza.io/decorators) to guard the products API (match case)
  | Name                | Project | Environment | Traffic Type |
  |---------------------|---------|-------------|--------------|
  | Stripe_Products_API | default | local       | Outbound     |

 4. Add a [browser API key](https://ui.demo.getstanza.io/admin?tab=keys) for the local environment to [stanzaConfig.ts](samples/next-with-stripe/stanzaConfig.ts)
