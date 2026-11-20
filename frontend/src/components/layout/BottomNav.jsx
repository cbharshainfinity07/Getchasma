import { Home, LayoutGrid, Heart, User, ShoppingBag } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/format'

export default function BottomNav() {
  const { pathname } = useLocation()
  const { cartCount, openCart } = useCart()
  const { count } = useWishlist()
  const { user } = useAuth()

  const items = [
    { icon: Home, label: 'Home', path: '/', match: (p) => p === '/' },
    { icon: LayoutGrid, label: 'Shop', path: '/shop', match: (p) => p.startsWith('/shop') },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: count, match: (p) => p === '/wishlist' },
    { icon: ShoppingBag, label: 'Bag', onClick: openCart, badge: cartCount, match: (p) => p === '/cart' },
    { icon: User, label: user ? 'Account' : 'Sign in', path: user ? '/account' : '/account/login', match: (p) => p.startsWith('/account') },
  ]

  if (pathname.startsWith('/checkout')) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-safe backdrop-blur-xl md:hidden" aria-label="Mobile tab bar">
      <div className="flex h-16 items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.match(pathname)
          const inner = (
            <>
              <span className="relative">
                <Icon className="size-5" strokeWidth={active ? 2.1 : 1.6} />
                {item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </>
          )
          const cls = cn('flex flex-1 flex-col items-center justify-center gap-1', active ? 'text-ink' : 'text-subtle')
          return item.onClick ? (
            <button key={item.label} onClick={item.onClick} className={cls}>
              {inner}
            </button>
          ) : (
            <Link key={item.label} to={item.path} className={cls} aria-current={active ? 'page' : undefined}>
              {inner}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
