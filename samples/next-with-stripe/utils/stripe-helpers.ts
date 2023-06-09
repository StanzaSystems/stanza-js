import { type StripeAPIProduct } from './stripe-api'

export function formatAmountForDisplay (
  amount: number,
  currency: string
): string {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })
  return numberFormat.format(amount)
}

export function formatAmountForStripe (
  amount: number,
  currency: string
): number {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100)
}

export function formatAmountFromStripe (
  amount: number,
  currency: string
): number {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })
  const parts = numberFormat.formatToParts(amount)
  let zeroDecimalCurrency = true
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount / 100)
}

export function productsFromStripeProduct (stripeProducts: StripeAPIProduct[]) {
  return stripeProducts.map((apiProduct) => ({
    name: apiProduct.name,
    id: apiProduct.id,
    currency: apiProduct.default_price.currency,
    image: apiProduct.images[0],
    tags: [],
    price: apiProduct.default_price.unit_amount,
    description: apiProduct.description,
    attribution: ''
  }))
}
