import { getStanzaFeature } from '@getstanza/node'

interface StripeAPIProduct {
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

      const feature = getStanzaFeature()
      console.log('############### getting products')
      console.log('feature', feature)

      // TODO: remove - just for testing purposes
      await fetch('http://localhost:3001/ping')

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${key}`
        }
      })
      return response.json()
    }
  }
}

export default getStripeAPI