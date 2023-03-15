import { useShoppingCart } from 'use-shopping-cart'
import { type Product as ProductData } from '../data/product'
import Product from './Product'

const Products = ({ products }: { products: ProductData[] }) => {
  const { addItem, removeItem } = useShoppingCart()

  return (
    <section className="products">
      {
        products.length > 0
          ? products.map((product) => <Product product={product} addProduct={addItem} removeProduct={removeItem}/>)
          : <p>No products found</p>
      }
    </section>
  )
}

export default Products
