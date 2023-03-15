import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import FeaturedProducts from '../components/FeaturedProducts'
import SearchBar from '../components/SearchBar'

const MainPage: NextPage = () => {
  const router = useRouter()

  const handleSearch = useCallback((searchValue: string) => {
    void router.push(`search?text=${searchValue}`)
  }, [])
  return (
    <>
      <SearchBar onSearch={handleSearch}/>
      <FeaturedProducts/>
    </>
  )
}

export default MainPage
