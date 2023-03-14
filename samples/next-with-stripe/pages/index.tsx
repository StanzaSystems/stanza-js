import { useStanzaContext } from '@getstanza/react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import Products from '../components/Products'
import SearchBar from '../components/SearchBar'
import StanzaComponent from '../components/StanzaComponent'
import products from '../data/products'

const MainPage: NextPage = () => {
  const stanzaContext = useStanzaContext('main')
  const router = useRouter()

  const handleSearch = useCallback((searchValue: string) => { void router.push(`search?text=${searchValue}`) }, [])
  return (
    <>
      <SearchBar onSearch={handleSearch}/>
      <StanzaComponent contextName="main" featureName="featured">
        <h2>Cool New Swag!</h2>
        <Products products={products}/>
      </StanzaComponent>
      {stanzaContext?.features.featured.message}
    </>
  )
}

export default MainPage
