import React, { useState, useEffect } from 'react'

import StripeTestCards from '../components/StripeTestCards'

import { useShoppingCart } from 'use-shopping-cart'
import { fetchPostJSON } from '../utils/api-helpers'
import * as Popover from '@radix-ui/react-popover'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useStanzaContext } from '@getstanza/react'

const CartSummary = () => {
  const [loading, setLoading] = useState(false)
  const [cartEmpty, setCartEmpty] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const {
    formattedTotalPrice,
    cartCount,
    clearCart,
    cartDetails,
    redirectToCheckout
  } = useShoppingCart()

  const stanzaContext = useStanzaContext('main')

  useEffect(() => {
    setCartEmpty(cartCount == null)
  }, [cartCount])

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const handleCheckout: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    console.dir(cartDetails)
    const response = await fetchPostJSON(
      '/api/checkout_sessions/cart',
      cartDetails
    )

    if (response.statusCode > 399) {
      console.error(response.message)
      setErrorMessage(response.message)
      setLoading(false)
      return
    }

    void redirectToCheckout(response.id)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="IconButton" aria-label="Update dimensions">
          <AiOutlineShoppingCart />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5}>
          {stanzaContext?.features.checkout.code !== 2 && (
            <form onSubmit={handleCheckout}>
              <h2>Cart summary</h2>
              {errorMessage.length > 0
                ? (
                <p style={{ color: 'red' }}>Error: {errorMessage}</p>
                  )
                : null}
              {/* This is where we'll render our cart */}
              <p suppressHydrationWarning>
                <strong>Number of Items:</strong> {cartCount}
              </p>
              <p suppressHydrationWarning>
                <strong>Total:</strong> {formattedTotalPrice}
              </p>

              {/* Redirects the user to Stripe */}
              <StripeTestCards />
              <button
                className="cart-style-background"
                type="submit"
                disabled={cartEmpty || loading}
              >
                Checkout
              </button>
              <button
                className="cart-style-background"
                type="button"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <div>{stanzaContext?.features.checkout.message}</div>
            </form>
          )}
          {stanzaContext?.features.checkout.code === 2 && (
            <div>{stanzaContext?.features.checkout.message}</div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default CartSummary
