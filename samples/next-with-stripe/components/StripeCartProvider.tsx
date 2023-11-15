'use client';
import React, { type ReactNode } from 'react';
import { CartProvider } from 'use-shopping-cart';
import * as config from '../config';

const StripeCartProvider = ({ children }: { children: ReactNode }) => (
  <CartProvider
    cartMode='checkout-session'
    stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string}
    currency={config.CURRENCY}
  >
    {children}
  </CartProvider>
);

export default StripeCartProvider;
