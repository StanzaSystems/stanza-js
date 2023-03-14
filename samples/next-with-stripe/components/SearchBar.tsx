import { useStanzaContext } from '@getstanza/react'
import React, { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'
import StanzaComponent from './StanzaComponent'

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
    <StanzaComponent
      contextName="main"
      featureName="search"
    >
      <input style={{ flexBasis: '75%' }}
             type="text"
             name="searchProducts"
             value={searchValue}
             onInput={updateSearchValue}
             placeholder={stanzaContext?.features.search.message}/>
    </StanzaComponent>
    <button style={{ flexBasis: '25%' }} className="elements-style-background">Search</button>
  </form>
}

export default SearchBar
