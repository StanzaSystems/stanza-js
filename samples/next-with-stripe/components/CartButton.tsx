import * as Popover from '@radix-ui/react-popover'
import React from 'react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useShoppingCart } from 'use-shopping-cart'
import CartSummary from './CartSummary'
import { WithStanzaFeature } from '@getstanza/react'

const CartButton = () => {
  const { cartCount = 0 } = useShoppingCart()
  return (
    <Popover.Root>
      <WithStanzaFeature name="checkout">
        {({ disabled }) => (
          <Popover.Trigger asChild>
            <button
              className="IconButton checkout-style-background badge-container icon-button"
              aria-label="Update dimensions"
              disabled={disabled}
            >
              <AiOutlineShoppingCart />
              {cartCount > 0 ? (
                <div className="badge">{cartCount}</div>
              ) : undefined}
            </button>
          </Popover.Trigger>
        )}
      </WithStanzaFeature>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5} align="end">
          <WithStanzaFeature
            name="checkout"
            fallback={({ message }) => (
              <p style={{ color: 'red' }}>Error: {message}</p>
            )}
          >
            <CartSummary />
          </WithStanzaFeature>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default CartButton
