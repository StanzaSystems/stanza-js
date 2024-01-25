import { withStanzaHeaders } from '@getstanza/core';
import Products from '../../components/Products';

export const SearchProducts = async ({
  searchString,
}: {
  searchString: string;
}) => {
  const products = await fetch(
    `http://localhost:4200/api/products?search=${searchString}`,
    {
      headers: withStanzaHeaders({ feature: 'search' }),
    }
  )
    .then(async (response) => response.json())
    .catch(() => {
      console.error('error fetching products');
      return [];
    });

  // console.log('products', products);

  return (
    <div>
      Search: {searchString}
      <Products products={products} />
    </div>
  );
};
