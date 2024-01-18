'use client';
import React, { type ReactNode } from 'react';
import { CartProvider } from 'use-shopping-cart';
import * as config from '../config';

const StripeCartProvider = ({ children }: { children: ReactNode }) => (
  <CartProvider
    cartMode='checkout-session'
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    currency={config.CURRENCY}
    shouldPersist={true}
  >
    {children}
  </CartProvider>
);

export default StripeCartProvider;
