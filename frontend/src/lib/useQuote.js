import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import { useCart } from '../context/CartContext'

/**
 * Server-side price quote for the current cart (+ optional discount code).
 * The API is the single source of truth for prices, stock, shipping, tax and available payment methods.
 */
export function useQuote(discountCode) {
  const { items, syncFromQuote } = useCart()
  const payload = {
    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })),
    discountCode: discountCode || null,
  }
  const query = useQuery({
    queryKey: ['quote', payload],
    queryFn: () => api.post('/cart/quote', payload),
    enabled: items.length > 0,
    retry: false,
    placeholderData: (prev) => prev,
  })
  useEffect(() => {
    if (query.data) syncFromQuote(query.data)
  }, [query.data, syncFromQuote])
  return query
}

/** Quote + discount-code flow shared by the cart and checkout pages. */
export function useCartQuote() {
  const { discountCode, setDiscountCode } = useCart()
  const [codeError, setCodeError] = useState(null)
  const quote = useQuote(discountCode)
  const fieldError = quote.error?.fields?.discountCode
  useEffect(() => {
    // Invalid code: surface the reason and fall back to a quote without it.
    if (fieldError && discountCode) {
      setCodeError(fieldError)
      setDiscountCode('')
    }
  }, [fieldError, discountCode, setDiscountCode])
  return {
    quote,
    discount: {
      applied: quote.data?.discountCode || null,
      error: codeError,
      loading: quote.isFetching && Boolean(discountCode),
      apply: (code) => {
        setCodeError(null)
        setDiscountCode(code)
      },
      remove: () => {
        setCodeError(null)
        setDiscountCode('')
      },
    },
  }
}

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
