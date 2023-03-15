import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import Products from '../components/Products'
import SearchBar from '../components/SearchBar'
import products from '../data/products'

const SearchPage = () => {
  const router = useRouter()
  const searchString = router.query.text?.toString() ?? ''
  const handleSearch = useCallback((searchValue: string) => {
    void router.push(`search?text=${searchValue}`)
  }, [])
  return (<>
    <SearchBar onSearch={handleSearch}/>
    <h2 className="section-title">Search results for: {searchString}</h2>
    <Products products={products.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()))}/>
  </>)
}

export default SearchPage
