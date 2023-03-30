import React, { useEffect, useState } from 'react'
import { type Product } from '../data/product'
import Products from './Products'
import StanzaComponent from './StanzaComponent'

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  useEffect(() => {
    fetch('api/products/featured', {
      headers: {
        baggage: 'stanzaFeature=featured'
      }
    })
      .then(async response => response.json())
      .then(data => { setFeaturedProducts(data) })
      .catch(() => {})
  }, [])
  return <StanzaComponent contextName="main" featureName="featured" removedFallback={({ message }) => (
    <p style={{ color: 'red' }}>{message}</p>
  )}>
    <h2 className="section-title">Fruit on Sale Today!</h2>
    <Products products={featuredProducts}/>
  </StanzaComponent>
}

export default FeaturedProducts
