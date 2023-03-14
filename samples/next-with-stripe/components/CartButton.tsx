import * as Popover from '@radix-ui/react-popover'
import React from 'react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import CartSummary from './CartSummary'
import StanzaComponent from './StanzaComponent'

const CartButton = () => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="IconButton checkout-style-background" aria-label="Update dimensions">
          <AiOutlineShoppingCart/>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5}>
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
