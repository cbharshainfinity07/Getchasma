import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react'
import { useCategories, useSettings } from '../../lib/queries'

function Instagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  )
}
function Facebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  )
}

export default function Footer() {
  const { data: settings } = useSettings()
  const { data: categories = [] } = useCategories()
  const store = settings?.store || {}

  const columns = [
    {
      title: 'Shop',
      links: [
        { label: 'All eyewear', to: '/shop' },
        ...categories.slice(0, 4).map((c) => ({ label: c.name, to: `/shop/${c.slug}` })),
        { label: 'Best sellers', to: '/shop?bestseller=true' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Track your order', to: '/track' },
        { label: 'FAQ', to: '/help/faq' },
        { label: 'Shipping & returns', to: '/help/shipping-returns' },
        { label: 'Privacy policy', to: '/help/privacy' },
        { label: 'Terms of service', to: '/help/terms' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign in', to: '/account/login' },
        { label: 'My orders', to: '/account' },
        { label: 'Wishlist', to: '/wishlist' },
        { label: 'Shopping bag', to: '/cart' },
      ],
    },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-line bg-paper pb-24 text-ink md:pb-0">
      <div className="mx-auto max-w-7xl px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 gap-10 md:grid-cols-12"
        >
          <div className="col-span-2 md:col-span-3">
            <Link to="/" aria-label="GetChasma home">
              <img src="/logo.webp" alt="GetChasma" className="h-11 w-auto invert" />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              Get the perfect vision you deserve. From stylish aviators to classic wayfarers, frames that express your unique personality.
            </p>
            <div className="mt-6 flex gap-2">
              {store.instagram && (
                <a href={store.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink/75 transition hover:border-ink hover:text-ink">
                  <Instagram className="size-4" />
                </a>
              )}
              {store.facebook && (
                <a href={store.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-ink/75 transition hover:border-ink hover:text-ink">
                  <Facebook className="size-4" />
                </a>
              )}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{col.title}</h4>
              <ul className="space-y-3 text-sm text-ink/75">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="transition hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-3">
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Contact</h4>
            <ul className="space-y-3.5 text-sm text-ink/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
                <span>{store.address || 'Kalaburagi, Karnataka, India'}</span>
              </li>
              {store.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-muted" />
                  <a href={store.whatsapp ? `https://wa.me/${store.whatsapp}` : `tel:${store.phone}`} target="_blank" rel="noreferrer" className="hover:text-ink">
                    {store.phone}
                  </a>
                </li>
              )}
              {store.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-muted" />
                  <a href={`mailto:${store.email}`} className="break-all hover:text-ink">
                    {store.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </motion.div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line-strong py-8 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} GetChasma.com. All rights reserved.</p>
          <p>
            Website developed by{' '}
            <a href="http://antmark.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-ink/75 hover:text-ink">
              Antmark.in <ArrowUpRight className="size-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Oversized wordmark echoes the hero typography */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="-mb-[0.18em] whitespace-nowrap text-center font-display text-[19vw] font-normal italic leading-none tracking-[-0.06em] text-ink/[0.05]">
          GetChasma
        </p>
      </div>
    </footer>
  )
}
