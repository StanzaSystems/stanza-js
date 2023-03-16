import React from 'react'
import products from '../data/products'
import Products from './Products'
import StanzaComponent from './StanzaComponent'

const FeaturedProducts = () => {
  const featuredProducts = products.filter(({ tags }) => tags.includes('featured'))
  return <StanzaComponent contextName="main" featureName="featured" removedFallback={({ message }) => (
    <p style={{ color: 'red' }}>{message}</p>
  )}>
    <h2 className="section-title">Fruit on Sale Today!</h2>
    <Products products={featuredProducts}/>
  </StanzaComponent>
}

export default FeaturedProducts
