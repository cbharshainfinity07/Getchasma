import { Link } from 'react-router-dom'
import { ArrowRight, Heart, User, Package } from 'lucide-react'
import { Drawer } from '../ui/Overlay'
import { useAuth } from '../../context/AuthContext'

export default function MobileMenu({ open, onClose, links, categories }) {
  const { user } = useAuth()
  return (
    <Drawer open={open} onClose={onClose} side="left" title={<img src="/logo.webp" alt="GetChasma" className="h-9 invert" />} label="Menu">
      <nav className="flex flex-col px-6 py-6" aria-label="Mobile">
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.label}>
              <Link to={l.to} onClick={onClose} className="flex items-center justify-between py-3 font-display text-2xl font-semibold tracking-tight">
                {l.label}
                <ArrowRight className="size-5 text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
        {categories.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">Categories</p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <Link key={c.id} to={`/shop/${c.slug}`} onClick={onClose} className="group overflow-hidden rounded-2xl bg-paper">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image} alt="" className="size-full object-cover" loading="lazy" />
                  </div>
                  <p className="px-3 py-2 text-sm font-medium">{c.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 space-y-1 border-t border-line pt-6 text-sm">
          <Link to={user ? '/account' : '/account/login'} onClick={onClose} className="flex items-center gap-3 py-2.5">
            <User className="size-4" /> {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in / Register'}
          </Link>
          <Link to="/wishlist" onClick={onClose} className="flex items-center gap-3 py-2.5">
            <Heart className="size-4" /> Wishlist
          </Link>
          <Link to="/track" onClick={onClose} className="flex items-center gap-3 py-2.5">
            <Package className="size-4" /> Track an order
          </Link>
        </div>
      </nav>
    </Drawer>
  )
}
