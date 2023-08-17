import { type NextApiHandler } from 'next'
import { type Product } from '../../../data/product'
import getStripeAPI from '../../../utils/stripe-api'

const handler: NextApiHandler = async (req, res) => {
  const stripeAPI = await getStripeAPI()

  const result = await stripeAPI.getProducts()
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
    .filter((_, index) => index < 2)
  res.json(resultProducts)
}
export default handler
