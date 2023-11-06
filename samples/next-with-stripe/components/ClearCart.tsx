import { useCallback, useEffect } from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export default function ClearCart () {
  const { clearCart } = useShoppingCart()

  const clearCartItems = useCallback(() => {
    return clearCart
  }, [clearCart])

  useEffect(() => {
    clearCartItems()
  }, [clearCartItems])

  return <p>Cart cleared.</p>
}
