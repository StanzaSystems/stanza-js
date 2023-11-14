import type { NextApiRequest, NextApiResponse } from 'next';

/*
 * Product data can be loaded from anywhere. In this case, we’re loading it from
 * a local JSON file, but this could also come from an async call to your
 * inventory management service, a database query, or some other API call.
 *
 * The important thing is that the product info is loaded from somewhere trusted
 * so you know the pricing information is accurate.
 */
// import inventory from '../../../data/products'

import getStripeAPI from '../../../utils/stripe-api';

import Stripe from 'stripe';
import { productsFromStripeProduct } from '../../../utils/stripe-helpers';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { validateCartItems } = require('use-shopping-cart/utilities');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-08-01',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const stripeAPI = await getStripeAPI();
      const stripeProducts = await stripeAPI.getProducts();
      const inventory = productsFromStripeProduct(stripeProducts.data);
      // Validate the cart details that were sent from the client.
      const lineItems = validateCartItems(inventory as any, req.body);
      console.dir(lineItems);
      console.dir(req.body);
      const hasSubscription = lineItems.find(
        (item: { price_data: { recurring: any } }) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          return !!item.price_data.recurring;
        },
      );
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: 'pay',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
        line_items: lineItems,
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
        mode: hasSubscription !== undefined ? 'subscription' : 'payment',
      };

      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params);

      res.status(200).json(checkoutSession);
    } catch (err) {
      console.log(err);
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error';
      res.status(500).json({ statusCode: 500, message: errorMessage });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
