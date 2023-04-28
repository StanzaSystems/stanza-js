import { getActiveStanzaEntry, nextRequestErrorHandler, stanzaDecorator } from '@getstanza/node'
import { type NextApiHandler } from 'next'
import { type Product } from '../../../data/product'
import getStripeAPI from '../../../utils/stripe-api'

const handler: NextApiHandler = async (req, res) => {
  const stripeAPI = await getStripeAPI()
  const result = await stripeAPI.getProducts()

  const activeFeature: string = getActiveStanzaEntry('stz-feat') ?? ''
  console.log(`Active Stanza feature: "${activeFeature}"`)

  const products = result.data
  const resultProducts: Product[] = products.map((apiProduct) => ({
    name: apiProduct.name,
    id: apiProduct.id,
    currency: apiProduct.default_price.currency,
    image: apiProduct.images[0],
    tags: [],
    price: apiProduct.default_price.unit_amount,
    description: apiProduct.description,
    attribution: ''
  }))
  const searchString = req.query.search?.toString() ?? ''
  res.json(resultProducts.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase())))
}

export default nextRequestErrorHandler(
  stanzaDecorator({ decorator: 'Stripe_Products_API', priorityBoost: 1 }).bind(handler)
)
