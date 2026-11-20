import { Link } from 'react-router-dom'
import { Check, Package, Truck, Home, ClipboardCheck, XCircle, RotateCcw } from 'lucide-react'
import { Badge } from '../ui/Feedback'
import { cn, formatDate, formatDateTime, formatPrice, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '../../lib/format'

const STEPS = [
  { key: 'pending', label: 'Placed', icon: ClipboardCheck },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Preparing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
]

export function OrderProgress({ status }) {
  if (status === 'cancelled' || status === 'refunded') {
    const Icon = status === 'cancelled' ? XCircle : RotateCcw
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-paper p-4 text-sm">
        <Icon className="size-5 text-muted" />
        <span>This order was {status}.</span>
      </div>
    )
  }
  const idx = STEPS.findIndex((s) => s.key === status)
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const done = i <= idx
        const Icon = s.icon
        return (
          <li key={s.key} className="flex flex-col items-center text-center">
            <div className="relative flex w-full items-center justify-center">
              {i > 0 && <span className={cn('absolute right-1/2 top-1/2 h-[2px] w-full -translate-y-1/2', i <= idx ? 'bg-ink' : 'bg-line')} />}
              <span
                className={cn(
                  'relative z-10 flex size-9 items-center justify-center rounded-full ring-4 ring-white transition',
                  done ? 'bg-ink text-white' : 'bg-paper text-subtle',
                )}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <span className={cn('mt-2 text-[11px] font-medium sm:text-xs', done ? 'text-ink' : 'text-subtle')} aria-current={i === idx ? 'step' : undefined}>
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function OrderView({ order, actions }) {
  const s = ORDER_STATUS[order.status]
  const ps = PAYMENT_STATUS[order.paymentStatus]
  const a = order.shippingAddress || {}
  return (
    <div className="space-y-6">
      <div className=" bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Order</p>
            <p className="font-display text-2xl font-bold tracking-tight">{order.orderNumber}</p>
            <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={s?.tone} dot>{s?.label}</Badge>
            <Badge tone={ps?.tone}>{ps?.label}</Badge>
          </div>
        </div>
        <div className="mt-8">
          <OrderProgress status={order.status} />
        </div>
        {order.trackingNumber && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl bg-paper px-4 py-3 text-sm">
            <span><span className="text-muted">Carrier:</span> <strong className="font-medium">{order.carrier || 'Not set'}</strong></span>
            <span><span className="text-muted">Tracking no.:</span> <strong className="font-medium">{order.trackingNumber}</strong></span>
          </div>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-2">{actions}</div>}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className=" bg-white p-6 shadow-card md:p-8">
          <h3 className="font-semibold">Items</h3>
          <ul className="mt-4 divide-y divide-line">
            {order.items?.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                  {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  {i.slug ? (
                    <Link to={`/product/${i.slug}`} className="text-sm font-medium hover:underline">{i.name}</Link>
                  ) : (
                    <p className="text-sm font-medium">{i.name}</p>
                  )}
                  <p className="text-xs text-muted">{[i.color, `Qty ${i.quantity}`].filter(Boolean).join(' · ')}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-success"><dt>Discount {order.discountCode && `(${order.discountCode})`}</dt><dd>−{formatPrice(order.discountTotal, { exact: true })}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shippingTotal ? formatPrice(order.shippingTotal) : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatPrice(order.total, { exact: !Number.isInteger(order.total) })}</dd></div>
            {order.taxTotal > 0 && <p className="text-right text-xs text-subtle">Includes {formatPrice(order.taxTotal, { exact: true })} tax</p>}
            {order.refundedAmount > 0 && (
              <div className="flex justify-between text-danger"><dt>Refunded</dt><dd>−{formatPrice(order.refundedAmount, { exact: true })}</dd></div>
            )}
          </dl>
        </div>

        <div className="space-y-6">
          <div className=" bg-white p-6 shadow-card">
            <h3 className="font-semibold">Delivery</h3>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
              <span className="font-medium text-ink">{order.customerName}</span>
              <br />
              {a.line1}
              {a.line2 && <>, {a.line2}</>}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {order.phone}
            </address>
          </div>
          <div className=" bg-white p-6 shadow-card">
            <h3 className="font-semibold">Payment</h3>
            <p className="mt-3 text-sm text-muted">{PAYMENT_METHOD[order.paymentMethod]}</p>
          </div>
          {order.events?.length > 0 && (
            <div className=" bg-white p-6 shadow-card">
              <h3 className="font-semibold">Updates</h3>
              <ol className="mt-4 space-y-4 border-l border-line pl-4">
                {[...order.events].reverse().map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-ink ring-4 ring-white" />
                    <p className="text-sm">{e.message}</p>
                    <p className="text-xs text-subtle">{formatDate(e.createdAt, { hour: 'numeric', minute: '2-digit' })}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
