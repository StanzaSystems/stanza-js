import { useStanzaContext } from '@getstanza/react';
import React, { useState } from 'react';
import { useShoppingCart, formatCurrencyString } from 'use-shopping-cart';
import { fetchPostJSON } from '../utils/api-helpers';
import StripeTestCards from './StripeTestCards';

const CartSummary = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    formattedTotalPrice,
    cartCount,
    clearCart,
    cartDetails,
    language,
    redirectToCheckout,
  } = useShoppingCart();
  const cartEmpty = cartCount === 0;

  const stanzaContext = useStanzaContext('main');

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleCheckout: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    console.dir(cartDetails);
    const response = await fetchPostJSON(
      '/api/checkout_sessions/cart',
      cartDetails
    );

    if (response.statusCode > 399) {
      console.error(response.message);
      setErrorMessage(response.message);
      setLoading(false);
      return;
    }

    void redirectToCheckout(response.id);
  };

  return (
    <form
      onSubmit={handleCheckout}
      style={{ padding: '16px' }}
    >
      <h2>Cart summary</h2>
      {errorMessage.length > 0 ? (
        <p style={{ color: 'red' }}>Error: {errorMessage}</p>
      ) : null}
      {stanzaContext?.features.checkout.message !== undefined ? (
        <p style={{ color: 'red' }}>
          {stanzaContext?.features.checkout.message}
        </p>
      ) : null}
      {/* This is where we'll render our cart */}
      {Object.values(cartDetails ?? {}).map((detail) => (
        <p key={detail.id}>
          {detail.name} - {detail.quantity} x{' '}
          {formatCurrencyString({
            value: detail.price,
            currency: detail.currency,
            language,
          })}{' '}
          - {detail.formattedValue}
        </p>
      ))}
      <p suppressHydrationWarning>
        <strong>Number of Items:</strong> {cartCount}
      </p>
      <p suppressHydrationWarning>
        <strong>Total:</strong> {formattedTotalPrice}
      </p>

      {/* Redirects the user to Stripe */}
      <StripeTestCards />
      <button
        className='cart-style-background'
        type='submit'
        disabled={cartEmpty || loading}
      >
        Checkout
      </button>
      <button
        className='cart-style-background'
        type='button'
        onClick={() => {
          clearCart();
        }}
      >
        Clear Cart
      </button>
    </form>
  );
};
export default CartSummary;
