import { ActionCode } from '@getstanza/browser'
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
      <input
        style={{ flexBasis: '75%' }}
        type="text"
        name="searchProducts"
        value={searchValue}
        onInput={updateSearchValue}
        disabled={stanzaContext?.features.search.code !== ActionCode.ENABLED}
        placeholder={stanzaContext?.features.search.message}
      />
      <button
        style={{ flexBasis: '25%' }}
        className="elements-style-background"
        disabled={stanzaContext?.features.search.code !== ActionCode.ENABLED}
      >Search</button>
    </StanzaComponent>
  </form>
}

export default SearchBar
