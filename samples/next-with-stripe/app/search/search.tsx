'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Products from '../../components/Products';
import SearchBar from '../../components/SearchBar';
import { type Product } from '../../data/product';
import { useSearchParams, useRouter } from 'next/navigation';
import { withStanzaHeaders } from '@getstanza/core';

const SearchPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams?.get('text') ?? '';
  const handleSearch = useCallback(
    (searchValue: string) => {
      router.push(`search?text=${searchValue}`);
    },
    [router]
  );

  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch(`api/products?search=${searchString}`, {
      headers: withStanzaHeaders({ feature: 'search' }),
    })
      .then(async (response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch(() => {});
  }, [searchString]);
  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <h2 className='section-title'>Search results for: {searchString}</h2>
      <Products products={products} />
    </>
  );
};

export default SearchPageComponent;
