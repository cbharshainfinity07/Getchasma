import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../lib/queries'
import { Drawer } from '../ui/Overlay'
import { EmptyState } from '../ui/Feedback'
import { QuantityStepper } from '../ui/Commerce'
import Button from '../ui/Button'
import { formatPrice } from '../../lib/format'

export function FreeShippingMeter({ subtotal, threshold }) {
  if (!threshold) return null
  const remaining = Math.max(0, threshold - subtotal)
  const pct = Math.min(100, (subtotal / threshold) * 100)
  return (
    <div className="rounded-2xl bg-paper px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-medium">
        <Truck className="size-3.5" />
        {remaining > 0 ? (
          <>You’re {formatPrice(remaining)} away from free shipping</>
        ) : (
          <>You’ve unlocked free shipping</>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-ink" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  )
}

export default function SideCart() {
  const { isCartOpen, closeCart, items, removeFromCart, setQuantity, cartTotal, cartCount } = useCart()
  const { data: settings } = useSettings()
  const navigate = useNavigate()

  const go = (path) => {
    closeCart()
    navigate(path)
  }

  return (
    <Drawer
      open={isCartOpen}
      onClose={closeCart}
      title={
        <span>
          Your bag <span className="font-normal text-muted">({cartCount})</span>
        </span>
      }
      label="Shopping bag"
      footer={
        items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-xl font-semibold tracking-tight">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-xs text-muted">Taxes included. Shipping and discounts calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => go('/cart')}>
                View bag
              </Button>
              <Button variant="primary" onClick={() => go('/checkout')}>Checkout</Button>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Frames you add will appear here. Start with our best sellers."
          action={
            <Button onClick={() => go('/shop')} size="sm">
              Shop eyewear
            </Button>
          }
        />
      ) : (
        <div className="space-y-5 p-6">
          <FreeShippingMeter subtotal={cartTotal} threshold={settings?.shipping?.freeThreshold} />
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={`${item.productId}-${item.color}`}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="flex gap-4 py-4"
                >
                  <Link to={`/product/${item.slug}`} onClick={closeCart} className="size-24 shrink-0 overflow-hidden rounded-2xl bg-paper">
                    <img src={item.image} alt={item.name} className="size-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/product/${item.slug}`} onClick={closeCart} className="line-clamp-1 text-sm font-medium hover:underline">
                          {item.name}
                        </Link>
                        {item.color && <p className="mt-0.5 text-xs text-muted">{item.color}</p>}
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper size="sm" value={item.quantity} onChange={(q) => setQuantity(item.productId, item.color, q)} />
                      <button
                        onClick={() => removeFromCart(item.productId, item.color)}
                        className="flex size-8 items-center justify-center rounded-full text-subtle transition hover:bg-danger-soft hover:text-danger"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </Drawer>
  )
}
