import { useStanzaContext } from '@getstanza/react'
import React, { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'

const SearchBar = ({ onSearch = () => {} }: { onSearch?: (searchValue: string) => void }) => {
  const [searchValue, setSearchValue] = useState('')
  const stanzaContext = useStanzaContext('main')

  const updateSearchValue = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(evt.target.value ?? '')
  }, [])

  const handleSearch = useCallback((event: FormEvent<HTMLFormElement>, searchValue: string) => {
    event.preventDefault()
    onSearch(searchValue)
  }, [searchValue])

  return <form style={{ display: 'flex', gap: '1rem' }} onSubmit={(evt) => {
    handleSearch(evt, searchValue)
  }} name="searchForm" autoComplete="off">
    <input style={{ flexBasis: '75%' }} type="text" name="searchProducts" value={searchValue} onInput={updateSearchValue}
           placeholder={stanzaContext?.features.search.message}></input>
    <button style={{ flexBasis: '25%' }} className="elements-style-background">Search</button>
  </form>
}

export default SearchBar
