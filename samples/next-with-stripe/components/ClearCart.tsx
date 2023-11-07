import { useEffect } from 'react'
import { useShoppingCart } from 'use-shopping-cart'

export default function ClearCart () {
  const { clearCart } = useShoppingCart()

  useEffect(() => {
    clearCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <p>Cart cleared.</p>
}
