import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Search, User, Heart, ShoppingBag, Menu, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useCategories, useSettings } from '../../lib/queries'
import { cn } from '../../lib/format'
import SearchOverlay from './SearchOverlay'
import MobileMenu from './MobileMenu'

const LINKS = [
  { label: 'Shop', to: '/shop', mega: true },
  { label: 'Sunglasses', to: '/shop/sunglasses' },
  { label: 'Eyeglasses', to: '/shop/eyeglasses' },
  { label: 'New In', to: '/shop?sort=newest' },
  { label: 'Track Order', to: '/track', wide: true },
]

function CountBadge({ count, dark }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          className={cn(
            'absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums',
            'bg-ink text-white',
          )}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export default function AppNavbar() {
  const { cartCount, toggleCart } = useCart()
  const { count: wishCount } = useWishlist()
  const { user } = useAuth()
  const { data: settings } = useSettings()
  const { data: categories = [] } = useCategories()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)

  // White, always-solid bar in the classic luxury style.
  const transparent = false

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))

  useEffect(() => {
    setMegaOpen(false)
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  // Keyboard shortcut: "/" opens search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const announcement = settings?.store?.announcement
  const iconBtn = cn(
    'relative flex size-10 items-center justify-center rounded-full transition-colors',
    transparent ? 'hover:bg-snow/10' : 'hover:bg-paper',
  )

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50" onMouseLeave={() => setMegaOpen(false)}>
        {/* Announcement bar collapses once the page scrolls */}
        <AnimatePresence initial={false}>
          {announcement && !scrolled && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className={cn('overflow-hidden text-center text-[10px] font-medium uppercase tracking-[0.08em] sm:text-[11px] sm:tracking-[0.12em]', 'border-b border-line bg-paper text-ink/80')}
            >
              <p className="truncate px-4 py-2">{announcement}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'border-b border-line bg-white/95 text-ink backdrop-blur-xl',
            scrolled && 'shadow-[0_8px_24px_-18px_rgb(0_0_0/0.25)]',
          )}
        >
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={cn('mx-auto flex max-w-[1400px] items-center justify-between px-4 sm:px-6 transition-[height] duration-300', scrolled ? 'h-14' : 'h-16 md:h-[72px]')}
            aria-label="Main"
          >
            {/* Left: links */}
            <div className="flex flex-1 items-center gap-1">
              <button className={cn(iconBtn, 'lg:hidden -ml-2')} onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <Menu className="size-[22px]" strokeWidth={1.5} />
              </button>
              <ul className="hidden items-center gap-1 lg:flex">
                {LINKS.map((l) => (
                  <li key={l.label} onMouseEnter={() => setMegaOpen(Boolean(l.mega))} className={l.wide ? 'hidden xl:block' : undefined}>
                    <NavLink
                      to={l.to}
                      end={l.to === '/shop'}
                      className={({ isActive }) =>
                        cn(
                          'relative whitespace-nowrap px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink/70 transition-colors hover:text-ink',
                          isActive && 'text-ink',
                        )
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Center: logo */}
            <Link to="/" className="flex shrink-0 items-center justify-center" aria-label="GetChasma home">
              <img
                src={settings?.branding?.logo || '/logo.webp'}
                alt="GetChasma"
                className={cn('w-auto object-contain transition-all duration-300', scrolled ? 'h-8' : 'h-9 md:h-10', 'invert')}
              />
            </Link>

            {/* Right: actions */}
            <div className="flex flex-1 items-center justify-end gap-0.5">
              <button className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search products (press /)">
                <Search className="size-[19px]" strokeWidth={1.6} />
              </button>
              <Link to={user ? '/account' : '/account/login'} className={cn(iconBtn, 'hidden md:flex')} aria-label={user ? 'My account' : 'Sign in'}>
                <User className="size-[19px]" strokeWidth={1.6} />
                {user && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-ink" aria-hidden />}
              </Link>
              <Link to="/wishlist" className={cn(iconBtn, 'hidden md:flex')} aria-label={`Wishlist, ${wishCount} items`}>
                <Heart className="size-[19px]" strokeWidth={1.6} />
                <CountBadge count={wishCount} dark={transparent} />
              </Link>
              <button className={iconBtn} onClick={toggleCart} aria-label={`Shopping bag, ${cartCount} items`}>
                <ShoppingBag className="size-[19px]" strokeWidth={1.6} />
                <CountBadge count={cartCount} dark={transparent} />
              </button>
            </div>
          </motion.nav>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="hidden border-b border-line bg-white shadow-[0_24px_40px_-30px_rgb(0_0_0/0.3)] lg:block"
              onMouseEnter={() => setMegaOpen(true)}
            >
              <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 py-8">
                <div className="col-span-3">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">Shop by</p>
                  <ul className="space-y-2.5 text-sm">
                    <li><Link className="hover:underline underline-offset-4" to="/shop">All eyewear</Link></li>
                    <li><Link className="hover:underline underline-offset-4" to="/shop?bestseller=true">Best sellers</Link></li>
                    <li><Link className="hover:underline underline-offset-4" to="/shop?onSale=true">On sale</Link></li>
                    <li><Link className="hover:underline underline-offset-4" to="/shop?genders=women">For her</Link></li>
                    <li><Link className="hover:underline underline-offset-4" to="/shop?genders=men">For him</Link></li>
                  </ul>
                </div>
                <div className="col-span-9 grid grid-cols-4 gap-4">
                  {categories.slice(0, 4).map((c) => (
                    <Link key={c.id} to={`/shop/${c.slug}`} className="group">
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-paper">
                        <img src={c.image} alt="" className="size-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                        {c.name}
                        <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                      </p>
                      <p className="text-xs text-muted">{c.productCount} styles</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={LINKS} categories={categories} />
    </>
  )
}
