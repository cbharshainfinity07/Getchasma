import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, ShieldCheck, Truck, RotateCcw, ShoppingBag, Share2, ChevronLeft, ChevronRight, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { useProduct, useSettings } from '../lib/queries'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { ColorDots, Price, QuantityStepper, StockIndicator } from '../components/ui/Commerce'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'
import { cn, formatPrice } from '../lib/format'

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 })
  const img = images[active]
  const go = (d) => setActive((i) => (i + d + images.length) % images.length)

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      {images.length > 1 && (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
          {images.map((im, i) => (
            <button
              key={im.id || im.url}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'aspect-square w-16 shrink-0 overflow-hidden rounded-2xl bg-paper ring-2 ring-offset-2 transition md:w-full',
                i === active ? 'ring-ink' : 'ring-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={im.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="group relative aspect-square flex-1 overflow-hidden bg-paper md:aspect-[4/4.4]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
      >
        <AnimatePresence mode="wait">
          {img && (
            <motion.img
              key={img.url}
              src={img.url}
              alt={img.alt || name}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: zoom.on ? 1.8 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.35 }, scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
              className="size-full cursor-zoom-in object-cover"
            />
          )}
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-card backdrop-blur transition group-hover:opacity-100 md:flex" aria-label="Previous image">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => go(1)} className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-card backdrop-blur transition group-hover:opacity-100 md:flex" aria-label="Next image">
              <ChevronRight className="size-4" />
            </button>
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function Accordion({ title, children, defaultOpen }) {
  return (
    <details open={defaultOpen} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-sm font-semibold">
        {title}
        <span className="text-xl leading-none text-muted transition group-open:rotate-45">+</span>
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  )
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-28 sm:px-6 md:grid-cols-2 md:pt-36">
      <Skeleton className="aspect-square" />
      <div className="space-y-4 pt-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-6 h-8 w-40" />
        <Skeleton className="mt-8 h-12 w-full rounded-full" />
      </div>
    </div>
  )
}

export default function ProductDetails() {
  const { slug } = useParams()
  const { data, isLoading, isError, error, refetch } = useProduct(slug)
  const { data: settings } = useSettings()
  const { addToCart } = useCart()
  const wishlist = useWishlist()
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(null)

  const product = data?.product
  useEffect(() => {
    setQty(1)
    setColor(product?.colors?.[0]?.name || null)
    if (product) document.title = `${product.name} | GetChasma`
    return () => {
      document.title = 'GetChasma | Perfect Glasses For Your Unique Style'
    }
  }, [product])

  if (isLoading) return <DetailsSkeleton />
  if (isError) {
    return (
      <div className="px-6 pt-32">
        {error?.status === 404 ? (
          <EmptyState icon={PackageX} title="This frame isn’t available" description="It may have been moved or is no longer in our collection." action={<Button to="/shop">Browse all eyewear</Button>} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    )
  }

  const soldOut = product.stockStatus === 'out_of_stock'
  const saved = wishlist.has(product.id)
  const maxQty = product.stockStatus === 'low_stock' ? product.stockLeft : 10
  const ship = settings?.shipping

  const add = () => addToCart(product, { quantity: qty, color })
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      }
    } catch {
      /* user cancelled */
    }
  }

  const specs = [
    ['Frame material', product.material],
    ['Frame shape', product.frameShape],
    ['Suitable for', product.gender === 'unisex' ? 'Everyone' : product.gender === 'men' ? 'Men' : 'Women'],
    ['Colours', product.colors.map((c) => c.name).join(', ')],
    ['SKU', product.sku],
  ].filter(([, v]) => v)

  return (
    <div className="bg-white pb-32 pt-24 md:pb-12 md:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          {product.category && (
            <>
              <span className="mx-1.5">/</span>
              <Link to={`/shop/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
            </>
          )}
          <span className="mx-1.5">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <Gallery images={product.images} name={product.name} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">{product.category?.name}</p>
                <h1 className="mt-2 font-display text-4xl font-normal leading-[1.02] tracking-[-0.045em] md:text-5xl">{product.name}</h1>
                {product.tagline && <p className="mt-3 text-[15px] text-muted">{product.tagline}</p>}
              </div>
              <button onClick={share} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line-strong transition hover:border-ink" aria-label="Share">
                <Share2 className="size-4" />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Price price={product.price} salePrice={product.salePrice} size="lg" showPercent />
            </div>
            <p className="mt-1.5 text-xs text-muted">Inclusive of all taxes{ship?.freeThreshold ? ` · Free shipping above ${formatPrice(ship.freeThreshold)}` : ''}</p>

            <div className="mt-6">
              <StockIndicator status={product.stockStatus} left={product.stockLeft} />
            </div>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm">
                  <span className="font-semibold">Colour:</span> <span className="text-muted">{color}</span>
                </p>
                <ColorDots colors={product.colors} max={12} size="lg" selected={color} onSelect={setColor} />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!soldOut && <QuantityStepper value={qty} onChange={(v) => setQty(Math.max(1, Math.min(maxQty, v)))} max={maxQty} />}
              <Button variant="primary" size="lg" className="hidden flex-1 md:inline-flex" onClick={add} disabled={soldOut}>
                <ShoppingBag className="size-4" /> {soldOut ? 'Sold out' : `Add to bag, ${formatPrice(product.effectivePrice * qty)}`}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-13"
                onClick={() => wishlist.toggle(product)}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
              >
                <Heart className={cn('size-5', saved && 'fill-danger text-danger')} />
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-2 bg-paper p-2">
              {[
                { icon: Truck, label: ship?.estimatedDelivery ? `Delivery in ${ship.estimatedDelivery}` : 'Fast delivery' },
                { icon: RotateCcw, label: '7-day easy returns' },
                { icon: ShieldCheck, label: '1-year warranty' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center text-[11px] font-medium leading-tight sm:text-xs">
                  <Icon className="size-4" strokeWidth={1.6} />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Accordion title="Description" defaultOpen>
                {product.description
                  ? product.description.split('\n').filter(Boolean).map((p, i) => <p key={i} className="mb-3 last:mb-0">{p}</p>)
                  : 'Details coming soon.'}
              </Accordion>
              <Accordion title="Specifications">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {specs.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-subtle">{k}</dt>
                      <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
              <Accordion title="Shipping & returns">
                <p>
                  Orders ship within 24-48 hours and usually arrive in {ship?.estimatedDelivery || '3-6 business days'}.
                  {ship?.freeThreshold ? ` Shipping is free on orders above ${formatPrice(ship.freeThreshold)}; otherwise a flat ${formatPrice(ship.flatRate)} applies.` : ''}
                </p>
                <p className="mt-3">
                  Not the right fit? Return unworn frames within 7 days of delivery for a full refund. <Link to="/help/shipping-returns" className="text-ink underline underline-offset-4">Read the policy</Link>.
                </p>
              </Accordion>
            </div>
          </div>
        </div>

        {data.related?.length > 0 && (
          <section className="mt-24 md:mt-32" aria-labelledby="related">
            <h2 id="related" className="mb-10 font-display text-3xl font-normal tracking-[-0.04em] md:text-4xl">
              You may also <span className="italic">like</span>
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
              {data.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky add-to-bag */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white/95 p-3 backdrop-blur-xl md:hidden">
        <Button variant="primary" full size="lg" onClick={add} disabled={soldOut}>
          <ShoppingBag className="size-4" /> {soldOut ? 'Sold out' : `Add to bag, ${formatPrice(product.effectivePrice * qty)}`}
        </Button>
      </div>
    </div>
  )
}
