import { ActionCode } from '@getstanza/browser'
import { useStanzaContext } from '@getstanza/react'
import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import Products from '../components/Products'
import SearchBar from '../components/SearchBar'
import products from '../data/products'

const MainPage: NextPage = () => {
  const stanzaContext = useStanzaContext('main')
  const router = useRouter()

  const handleSearch = useCallback((searchValue: string) => { void router.push(`search?text=${searchValue}`) }, [])
  return (
    <>
      <SearchBar onSearch={handleSearch}/>
      {stanzaContext?.features.featured.code !== ActionCode.DISABLED_REMOVE.valueOf() && (
        <>
          <h2>Cool New Swag!</h2>
          <Products products={products}/>
        </>
      )}
      {stanzaContext?.features.featured.message}
    </>
  )
}

export default MainPage
