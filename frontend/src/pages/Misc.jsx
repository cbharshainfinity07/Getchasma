import { Link, useParams } from 'react-router-dom'
import { Heart, Compass } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useProductsByIds, useSettings } from '../lib/queries'
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard'
import { EmptyState } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import { formatPrice } from '../lib/format'

export function Wishlist() {
  const { ids } = useWishlist()
  const { data = [], isLoading } = useProductsByIds(ids)
  const products = data.filter((p) => ids.includes(p.id))

  return (
    <div className="min-h-[70vh] bg-white pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <h1 className="font-display text-4xl font-normal tracking-[-0.045em] md:text-6xl">
          Wishlist <span className="text-subtle">({ids.length})</span>
        </h1>
        {ids.length === 0 ? (
          <EmptyState icon={Heart} title="Nothing saved yet" description="Tap the heart on any frame to save it here for later." action={<Button to="/shop">Discover frames</Button>} />
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {isLoading && !products.length
              ? ids.map((id) => <ProductCardSkeleton key={id} />)
              : products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-white px-6 pt-24 text-center text-ink">
      <div>
        <p className="font-display text-[28vw] font-normal italic leading-none tracking-[-0.08em] text-ink/[0.06] md:text-[14rem]">404</p>
        <h1 className="-mt-6 font-display text-3xl font-normal tracking-tight md:text-5xl">
          This page is <span className="italic">out of focus</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-muted">The link may be broken or the page may have moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to="/">Go home</Button>
          <Button variant="secondary" to="/shop"><Compass className="size-4" /> Browse shop</Button>
        </div>
      </div>
    </div>
  )
}

/** Help / policy pages. Uses live store settings for contact and shipping details. */
export function InfoPage() {
  const { slug } = useParams()
  const { data: settings } = useSettings()
  const s = settings?.store || {}
  const ship = settings?.shipping || {}

  const pages = {
    faq: {
      title: 'Frequently asked questions',
      sections: [
        ['Can I add my prescription?', 'Yes. All optical frames are prescription-ready. After ordering, share your prescription with us on WhatsApp or email and our opticians will fit your lenses.'],
        ['Do sunglasses offer UV protection?', 'Every GetChasma sunglass lens blocks 100% of UVA and UVB (UV400). Polarised models also cut glare from roads and water.'],
        ['How do I choose the right size?', 'Each product lists its frame shape. If you’re unsure, message us a photo and we’ll recommend a fit.'],
        ['Is cash on delivery available?', `Yes, cash on delivery is available on most orders${settings?.payments ? '' : ''}. Online payment options appear at checkout when enabled.`],
        ['How can I track my order?', 'Use the Track Order page with your order number and email, or sign in to see all your orders.'],
      ],
    },
    'shipping-returns': {
      title: 'Shipping & returns',
      sections: [
        ['Shipping', `We ship across ${ship.shipsTo || 'India'}. Orders are dispatched within 24-48 hours and usually arrive in ${ship.estimatedDelivery || '3-6 business days'}. ${ship.freeThreshold ? `Shipping is free on orders above ${formatPrice(ship.freeThreshold)}; a flat ${formatPrice(ship.flatRate || 0)} applies otherwise.` : ''}`],
        ['Returns', 'Unworn frames in original packaging can be returned within 7 days of delivery. Contact us with your order number to start a return.'],
        ['Refunds', 'Refunds are issued to the original payment method within 5-7 business days of receiving the return. Cash-on-delivery orders are refunded by bank transfer or UPI.'],
        ['Damaged items', 'If your order arrives damaged, contact us within 48 hours with photos and we’ll replace it free of charge.'],
      ],
    },
    privacy: {
      title: 'Privacy policy',
      sections: [
        ['What we collect', 'We collect the details needed to process your order (name, contact information and delivery address) and, if you create an account, your login email and a securely hashed password.'],
        ['How we use it', 'Your information is used only to fulfil orders, provide support and, if you subscribe, send our newsletter. We never sell your data.'],
        ['Payments', 'Online payments are processed by our payment partner. We never see or store your card details.'],
        ['Your choices', `You can request a copy or deletion of your data at any time by emailing ${s.email || 'us'}.`],
      ],
    },
    terms: {
      title: 'Terms of service',
      sections: [
        ['Orders', 'All orders are subject to availability and confirmation. Prices are listed in INR and include applicable taxes unless stated otherwise.'],
        ['Pricing errors', 'If a product is listed at an incorrect price we may cancel the order and refund any payment in full.'],
        ['Warranty', 'Frames carry a 1-year warranty against manufacturing defects. Normal wear, accidental damage and lens scratches are not covered.'],
        ['Contact', `Questions about these terms? Reach us at ${s.email || 'our support email'} or ${s.phone || 'our support line'}.`],
      ],
    },
  }
  const page = pages[slug]
  if (!page) return <NotFound />

  return (
    <div className="bg-white pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">Help centre</p>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.045em] md:text-5xl">{page.title}</h1>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {page.sections.map(([h, t]) => (
            <section key={h} className="py-7">
              <h2 className="font-display text-lg font-semibold tracking-tight">{h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 bg-paper p-6 text-sm">
          Still need help? Email <a href={`mailto:${s.email}`} className="font-medium underline">{s.email}</a> or call{' '}
          <a href={`tel:${s.phone}`} className="font-medium underline">{s.phone}</a>.{' '}
          <Link to="/track" className="font-medium underline">Track an order</Link>.
        </div>
      </div>
    </div>
  )
}
