import React from 'react';
import { SearchProducts } from './SearchProducts';
import { SearchBarComponent } from './SearchBarComponent';

const SearchPage = async (props: { searchParams: { text: string } }) => {
  const {
    searchParams: { text: searchString },
  } = props;
  return (
    <>
      <SearchBarComponent />
      <h2 className='section-title'>Search results for: {searchString}</h2>
      <SearchProducts searchString={searchString} />
    </>
  );
};

export default SearchPage;
