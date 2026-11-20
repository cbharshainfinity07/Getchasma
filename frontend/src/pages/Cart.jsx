import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag, Trash2, Heart, Lock, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCartQuote } from '../lib/useQuote'
import { useSettings } from '../lib/queries'
import { QuantityStepper } from '../components/ui/Commerce'
import { EmptyState, Alert } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import { DiscountForm, Totals } from '../components/cart/OrderSummary'
import { FreeShippingMeter } from '../components/cart/SideCart'
import { ProductTabs } from '../components/home/Story'
import { formatPrice } from '../lib/format'

export default function Cart() {
  const { items, removeFromCart, setQuantity } = useCart()
  const wishlist = useWishlist()
  const { data: settings } = useSettings()
  const { quote, discount } = useCartQuote()

  if (items.length === 0) {
    return (
      <div className="pt-28 md:pt-36">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Looks like you haven’t added any frames yet."
          action={<Button to="/shop">Start shopping</Button>}
        />
        <ProductTabs />
      </div>
    )
  }

  const problems = quote.data?.problems || []
  const problemFor = (id) => problems.find((p) => p.productId === id)

  return (
    <div className="bg-white pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <h1 className="font-display text-4xl font-normal tracking-[-0.045em] md:text-6xl">Your bag</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
          <div>
            {problems.length > 0 && (
              <Alert tone="warning" title="Some items need attention" className="mb-6">
                Update the highlighted items to continue to checkout.
              </Alert>
            )}
            <ul className="divide-y divide-line border-y border-line">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const problem = problemFor(item.productId)
                  return (
                    <motion.li
                      key={`${item.productId}-${item.color}`}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-5 py-6"
                    >
                      <Link to={`/product/${item.slug}`} className="size-28 shrink-0 overflow-hidden rounded-2xl bg-paper sm:size-36">
                        <img src={item.image} alt={item.name} className="size-full object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex justify-between gap-4">
                          <div className="min-w-0">
                            <Link to={`/product/${item.slug}`} className="font-display text-lg font-semibold tracking-tight hover:underline">
                              {item.name}
                            </Link>
                            {item.color && <p className="mt-0.5 text-sm text-muted">Colour: {item.color}</p>}
                            <p className="mt-1 text-sm">
                              {formatPrice(item.price)}
                              {item.originalPrice > item.price && <span className="ml-2 text-xs text-subtle line-through">{formatPrice(item.originalPrice)}</span>}
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        {problem && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
                            <AlertCircle className="size-3.5" /> {problem.message}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                          <QuantityStepper size="sm" value={item.quantity} onChange={(q) => setQuantity(item.productId, item.color, q)} />
                          <button
                            onClick={() => {
                              if (!wishlist.has(item.productId)) wishlist.toggle({ id: item.productId, name: item.name })
                              removeFromCart(item.productId, item.color)
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
                          >
                            <Heart className="size-3.5" /> Save for later
                          </button>
                          <button onClick={() => removeFromCart(item.productId, item.color)} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger">
                            <Trash2 className="size-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            <Link to="/shop" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">
              Continue shopping
            </Link>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className=" bg-paper p-6 md:p-8">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-5">
                <FreeShippingMeter subtotal={quote.data?.subtotal - (quote.data?.discountTotal || 0) || 0} threshold={settings?.shipping?.freeThreshold} />
              </div>
              <div className="mt-5">
                <DiscountForm applied={discount.applied} onApply={discount.apply} onRemove={discount.remove} error={discount.error} loading={discount.loading} />
              </div>
              <Totals quote={quote.data} loading={quote.isFetching} className="mt-6" />
              <Button variant="primary" to={problems.length ? undefined : '/checkout'} disabled={problems.length > 0} size="lg" full className="mt-6">
                <Lock className="size-4" /> Secure checkout
              </Button>
              <p className="mt-4 text-center text-xs text-muted">Cash on delivery available · 7-day returns</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
