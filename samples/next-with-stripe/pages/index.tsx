import { stanzaSession } from '@getstanza/next'
import { type GetServerSideProps, type NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import FeaturedProducts from '../components/FeaturedProducts'
import SearchBar from '../components/SearchBar'

const { getEnablementNumber } = stanzaSession()

export const getServerSideProps: GetServerSideProps = async (context) => {
  const enablementNumber = await getEnablementNumber(context.req)
  return {
    props: { enablementNumber }
  }
}

const MainPage: NextPage = (_props: { enablementNumber?: number }) => {
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
