import { ActionCode } from '@getstanza/browser'
import { useStanzaContext } from '@getstanza/react'
import * as Popover from '@radix-ui/react-popover'
import React from 'react'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import CartSummary from './CartSummary'

const CartButton = () => {
  const stanzaContext = useStanzaContext('main')

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="IconButton checkout-style-background" aria-label="Update dimensions">
          <AiOutlineShoppingCart />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="PopoverContent" sideOffset={5}>
          {stanzaContext?.features.checkout.code !== ActionCode.DISABLED_REMOVE && (
            <CartSummary/>
          )}
          {stanzaContext?.features.checkout.code === ActionCode.DISABLED_REMOVE && (
             <p style={{ color: 'red' }}>Error: {stanzaContext?.features.checkout.message}</p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default CartButton
