'use client'
import SearchBar from '../../components/SearchBar';
import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const SearchBarComponent = () => {
  const router = useRouter();
  const handleSearch = useCallback(
    (searchValue: string) => {
      router.push(`search?text=${searchValue}`);
    },
    [router]
  );

  return <SearchBar onSearch={handleSearch} />;
};
