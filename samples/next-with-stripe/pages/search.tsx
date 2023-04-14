import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import Products from '../components/Products'
import SearchBar from '../components/SearchBar'
import { type Product } from '../data/product'

const SearchPage = () => {
  const router = useRouter()
  const searchString = router.query.text?.toString() ?? ''
  const handleSearch = useCallback((searchValue: string) => {
    void router.push(`search?text=${searchValue}`)
  }, [])

  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    fetch(`api/products?search=${searchString}`, {
      headers: {
        baggage: 'stz-feat=search'
      }
    })
      .then(async response => response.json())
      .then(data => { setProducts(data) })
      .catch(() => {})
  }, [searchString])
  return (<>
    <SearchBar onSearch={handleSearch}/>
    <h2 className="section-title">Search results for: {searchString}</h2>
    <Products products={products}/>
  </>)
}

export default SearchPage
