/**
 * This is a singleton to ensure we only instantiate Stripe once.
 */
import { type Stripe, loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>
const getStripe = async () => {
  if (stripePromise !== null) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
    )
  }
  return stripePromise
}

export default getStripe
