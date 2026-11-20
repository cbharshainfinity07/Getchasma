import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)
const KEY = 'gc_wishlist'

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.filter(Number.isInteger) : []
  } catch {
    return []
  }
}

/**
 * Guests keep their wishlist in localStorage. When a customer signs in, the local list is merged with the
 * one saved on their account, and every change after that is persisted to the API.
 */
export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(read)
  const syncedFor = useRef(null)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids))
  }, [ids])

  useEffect(() => {
    if (!user || syncedFor.current === user.id) return
    syncedFor.current = user.id
    api
      .get('/account/wishlist')
      .then(({ productIds }) => {
        const merged = [...new Set([...read(), ...productIds])]
        setIds(merged)
        if (merged.length !== productIds.length) return api.put('/account/wishlist', { productIds: merged })
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) syncedFor.current = null
  }, [user])

  const persist = useCallback(
    (next) => {
      if (user) api.put('/account/wishlist', { productIds: next }).catch(() => {})
    },
    [user],
  )

  // Side effects (toast, API) stay outside state updaters so StrictMode double-invocation can't duplicate them.
  const idsRef = useRef(ids)
  idsRef.current = ids

  const toggle = useCallback(
    (product) => {
      const prev = idsRef.current
      const has = prev.includes(product.id)
      const next = has ? prev.filter((x) => x !== product.id) : [product.id, ...prev]
      setIds(next)
      persist(next)
      toast(has ? 'Removed from wishlist' : 'Saved to wishlist', { description: product.name })
    },
    [persist],
  )

  const remove = useCallback(
    (id) => {
      const next = idsRef.current.filter((x) => x !== id)
      setIds(next)
      persist(next)
    },
    [persist],
  )

  const value = useMemo(() => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle, remove }), [ids, toggle, remove])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
