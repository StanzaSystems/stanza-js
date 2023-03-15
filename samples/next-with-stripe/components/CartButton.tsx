import * as Popover from '@radix-ui/react-popover'
import React from 'react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useShoppingCart } from 'use-shopping-cart'
import CartSummary from './CartSummary'
import StanzaComponent from './StanzaComponent'

const CartButton = () => {
  const { cartCount = 0 } = useShoppingCart()
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="IconButton checkout-style-background badge-container icon-button" aria-label="Update dimensions">
          <AiOutlineShoppingCart/>
          {cartCount > 0 ? <div className="badge">{cartCount}</div> : undefined}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5} align="end">
          <StanzaComponent
            contextName="main"
            featureName="checkout"
            removedFallback={({ message }) => <p style={{ color: 'red' }}>Error: {message}</p>}
          >
            <CartSummary/>
          </StanzaComponent>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default CartButton
