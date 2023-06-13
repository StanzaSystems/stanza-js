export interface StripeAPIProduct {
  id: string
  object: string
  active: boolean
  created: number
  default_price: {
    id: string
    currency: string
    unit_amount: number
  }
  description: string
  images: string[]
  livemode: boolean
  metadata: Record<string, unknown>
  name: string
}

interface StripeAPI {
  getProducts: () => Promise<{ data: StripeAPIProduct[] }>
}

let stripePromise: Promise<StripeAPI> | null = null
const getStripeAPI = async () => {
  if (stripePromise === null) {
    stripePromise = createStripeAPI(process.env.STRIPE_SECRET_KEY ?? '')
  }
  return stripePromise
}

const PRODUCTS_URL = 'https://api.stripe.com/v1/products'

const createStripeAPI = async (key: string): Promise<StripeAPI> => {
  return {
    async getProducts () {
      const url = new URL(PRODUCTS_URL)

      url.searchParams.append('expand[]', 'data.default_price')

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${key}`
        }
      })
      if (!response.ok) {
        throw new Error(`Stripe API did not return correctly: ${response.statusText}`)
      }
      return response.json()
    }
  }
}

export default getStripeAPI
