import { WithStanzaFeature } from '@getstanza/react';
import React, {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useState,
} from 'react';

const SearchBar = ({
  onSearch = () => {},
}: {
  onSearch?: (searchValue: string) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');

  const updateSearchValue = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setSearchValue(evt.target.value ?? '');
    },
    [],
  );

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>, searchValue: string) => {
      event.preventDefault();
      setSearchValue('');
      onSearch(searchValue);
    },
    [searchValue, onSearch],
  );

  return (
    <form
      style={{ display: 'flex', gap: '1rem' }}
      onSubmit={(evt) => {
        handleSearch(evt, searchValue);
      }}
      name="searchForm"
      autoComplete="off"
    >
      <WithStanzaFeature name="search">
        {({ disabled, message }) => (
          <>
            <input
              style={{ flexBasis: '75%' }}
              type="text"
              name="searchProducts"
              value={searchValue}
              onInput={updateSearchValue}
              disabled={disabled}
              placeholder={disabled ? message : 'Search products...'}
            />
            <button
              style={{ flexBasis: '25%' }}
              className="elements-style-background"
              disabled={disabled}
            >
              Search
            </button>
          </>
        )}
      </WithStanzaFeature>
    </form>
  );
};

export default SearchBar;
