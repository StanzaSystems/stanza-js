import React, { useEffect, useState } from 'react'
import { type Product } from '../data/product'
import Products from './Products'
import { WithStanzaFeature } from '@getstanza/react'
import { withStanzaHeaders } from '@getstanza/core'

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  useEffect(() => {
    fetch('api/products/featured', {
      headers: withStanzaHeaders({ feature: 'featured' })
    })
      .then(async response => response.json())
      .then(data => { setFeaturedProducts(data) })
      .catch(() => {})
  }, [])
  return <WithStanzaFeature name="featured" fallback={({ message }) => (
    <p style={{ color: 'red' }}>{message}</p>
  )}>
    <h2 className="section-title">Stanza&apos;s Kid Picks!</h2>
    <Products products={featuredProducts}/>
  </WithStanzaFeature>
}

export default FeaturedProducts
