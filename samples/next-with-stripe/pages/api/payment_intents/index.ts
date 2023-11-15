import { type NextApiRequest, type NextApiResponse } from 'next'

import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../config'
import { formatAmountForStripe } from '../../../utils/stripe-helpers'

import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-08-01'
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  const {
    amount,
    paymentIntentId
  }: { amount: number; paymentIntentId?: string } = req.body
  // Validate the amount that was passed from the client.
  if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
    res.status(500).json({ statusCode: 400, message: 'Invalid amount.' })
    return
  }
  if (paymentIntentId !== undefined) {
    try {
      const currentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId)
      // If PaymentIntent has been created, just update the amount.
      if (currentIntent !== undefined) {
        const updatedIntent = await stripe.paymentIntents.update(
          paymentIntentId,
          {
            amount: formatAmountForStripe(amount, CURRENCY)
          }
        )
        res.status(200).json(updatedIntent)
        return
      }
    } catch (e) {
      if ((e as any).code !== 'resource_missing') {
        const errorMessage =
          e instanceof Error ? e.message : 'Internal server error'
        res.status(500).json({ statusCode: 500, message: errorMessage })
        return
      }
    }
  }
  try {
    // Create PaymentIntent from body params.
    const params: Stripe.PaymentIntentCreateParams = {
      amount: formatAmountForStripe(amount, CURRENCY),
      currency: CURRENCY,
      description: process.env.STRIPE_PAYMENT_DESCRIPTION ?? '',
      automatic_payment_methods: {
        enabled: true
      }
    }
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.create(params)

    res.status(200).json(paymentIntent)
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ statusCode: 500, message: errorMessage })
  }
}
