import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import Products from '../components/Products'
import SearchBar from '../components/SearchBar'
import StanzaComponent from '../components/StanzaComponent'
import products from '../data/products'

const MainPage: NextPage = () => {
  const router = useRouter()

  const handleSearch = useCallback((searchValue: string) => {
    void router.push(`search?text=${searchValue}`)
  }, [])
  return (
    <>
      <SearchBar onSearch={handleSearch}/>
      <StanzaComponent contextName="main" featureName="featured" removedFallback={({ message }) => (
        <p style={{ color: 'red' }}>{message}</p>
      )}>
        <h2>Cool New Swag!</h2>
        <Products products={products}/>
      </StanzaComponent>
    </>
  )
}

export default MainPage
