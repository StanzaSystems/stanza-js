import { useEffect, useState } from 'react';
import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import PrintObject from '../components/PrintObject';

import { fetchGetJSON } from '../utils/api-helpers';
import { useShoppingCart } from 'use-shopping-cart';

const ResultPage: NextPage = () => {
  const [hasClearedCart, setHasClearedCart] = useState(false);
  const router = useRouter();
  const { clearCart } = useShoppingCart();

  // Fetch CheckoutSession from static page via
  // https://nextjs.org/docs/basic-features/data-fetching#static-generation
  const { data, error } = useSWR(
    router?.query?.session_id !== undefined
      ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `/api/checkout_sessions/${router.query.session_id}`
      : null,
    fetchGetJSON
  );

  useEffect(() => {
    if (data !== undefined && !hasClearedCart) {
      setHasClearedCart(true);
      clearCart();
    }
  }, [data, clearCart, hasClearedCart]);

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (error) return <div>failed to load</div>;

  return (
    <div className='page-container'>
      <h1>Checkout Payment Result</h1>
      <h2>Status: {data?.payment_intent?.status ?? 'loading...'}</h2>
      <h3>CheckoutSession response:</h3>
      <PrintObject content={data ?? 'loading...'} />
      {hasClearedCart && <p>Cart cleared</p>}
    </div>
  );
};

export default ResultPage;
