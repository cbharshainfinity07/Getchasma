import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const CartContext = createContext(null)
const STORAGE_KEY = 'gc_cart_v2'
const MAX_QTY = 10

const lineKey = (productId, color) => `${productId}::${color || ''}`

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored.filter((i) => i && i.productId && i.quantity > 0) : []
  } catch {
    return []
  }
}

/**
 * Cart lives in localStorage so it survives reloads for guests. Prices shown here are a snapshot for
 * instant UI; the cart page and checkout always re-price through the API (/cart/quote).
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(load)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState(() => localStorage.getItem('gc_discount') || '')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage full or disabled */
    }
  }, [items])

  useEffect(() => {
    if (discountCode) localStorage.setItem('gc_discount', discountCode)
    else localStorage.removeItem('gc_discount')
  }, [discountCode])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e) => e.key === STORAGE_KEY && setItems(load())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addToCart = useCallback((product, { quantity = 1, color, open = true } = {}) => {
    if (product.stockStatus === 'out_of_stock') {
      toast.error(`${product.name} is out of stock`)
      return
    }
    const chosen = color || product.colors?.[0]?.name || null
    const key = lineKey(product.id, chosen)
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i.productId, i.color) === key)
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.color) === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images?.[0]?.url || product.image || null,
          price: product.effectivePrice ?? product.price,
          originalPrice: product.price,
          color: chosen,
          quantity: Math.min(MAX_QTY, quantity),
        },
      ]
    })
    if (open) setIsCartOpen(true)
    else toast.success(`${product.name} added to your bag`)
  }, [])

  const removeFromCart = useCallback((productId, color) => {
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.color) !== lineKey(productId, color)))
  }, [])

  const setQuantity = useCallback((productId, color, quantity) => {
    const q = Math.max(1, Math.min(MAX_QTY, quantity))
    setItems((prev) =>
      prev.map((i) => (lineKey(i.productId, i.color) === lineKey(productId, color) ? { ...i, quantity: q } : i)),
    )
  }, [])

  /** Apply authoritative prices/quantities from a server quote. */
  const syncFromQuote = useCallback((quote) => {
    if (!quote?.items) return
    setItems((prev) =>
      prev.map((i) => {
        const q = quote.items.find((x) => x.productId === i.productId && (x.color || null) === (i.color || null))
          || quote.items.find((x) => x.productId === i.productId)
        return q ? { ...i, price: q.unitPrice, originalPrice: q.originalPrice, name: q.name, image: q.image ?? i.image } : i
      }),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setDiscountCode('')
  }, [])

  const value = useMemo(() => {
    const cartCount = items.reduce((n, i) => n + i.quantity, 0)
    const cartTotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
    return {
      items,
      cartItems: items,
      cartCount,
      cartTotal,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      toggleCart: () => setIsCartOpen((v) => !v),
      addToCart,
      removeFromCart,
      setQuantity,
      updateQuantity: (productId, color, delta) => {
        const line = items.find((i) => lineKey(i.productId, i.color) === lineKey(productId, color))
        if (line) setQuantity(productId, color, line.quantity + delta)
      },
      syncFromQuote,
      clearCart,
      discountCode,
      setDiscountCode,
      quotePayload: { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })) },
    }
  }, [items, isCartOpen, addToCart, removeFromCart, setQuantity, syncFromQuote, clearCart, discountCode])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
