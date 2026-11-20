import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Truck, RotateCcw, XCircle, CheckCircle2, MessageSquare, Copy, Printer, BadgeIndianRupee, User } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatDateTime, formatPrice, ORDER_STATUS, PAYMENT_METHOD } from '../../lib/format'
import { Field, Input, Textarea, Checkbox } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Overlay'
import { ErrorState, PageLoader, Alert } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, OrderStatusBadge, PaymentBadge, Thumb } from '../ui'
import { OrderProgress } from '../../components/order/OrderView'
import { useAdmin } from '../context'

const NEXT_LABEL = {
  confirmed: 'Confirm order',
  processing: 'Start processing',
  shipped: 'Mark as shipped',
  delivered: 'Mark as delivered',
}

function StatusModal({ order, target, onClose, onDone }) {
  const [form, setForm] = useState({ carrier: order.carrier || '', trackingNumber: order.trackingNumber || '', note: '', cancelReason: '', restockItems: true })
  const m = useMutation({
    mutationFn: (body) => api.patch(`/admin/orders/${order.id}/status`, body),
    onSuccess: (o) => {
      toast.success(`Order ${ORDER_STATUS[o.status].label.toLowerCase()}`)
      onDone(o)
    },
    onError: (e) => toast.error(e.message),
  })
  const cancel = target === 'cancelled'
  const ship = target === 'shipped'
  return (
    <Modal
      open
      onClose={onClose}
      title={cancel ? 'Cancel order' : NEXT_LABEL[target] || `Mark as ${target}`}
      description={`${order.orderNumber} · ${order.customerName}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Back</Button>
          <Button
            size="sm"
            variant={cancel ? 'danger' : 'primary'}
            loading={m.isPending}
            onClick={() => m.mutate({ status: target, ...form })}
          >
            {cancel ? 'Cancel order' : 'Update status'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {ship && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Carrier" error={m.error?.fields?.carrier}>
              {(p) => <Input {...p} value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} placeholder="Delhivery, Blue Dart…" list="carriers" />}
            </Field>
            <datalist id="carriers">{['Delhivery', 'Blue Dart', 'DTDC', 'India Post', 'Ekart', 'Xpressbees', 'Shiprocket'].map((c) => <option key={c} value={c} />)}</datalist>
            <Field label="Tracking number" required error={m.error?.fields?.trackingNumber}>
              {(p) => <Input {...p} value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} error={m.error?.fields?.trackingNumber} />}
            </Field>
          </div>
        )}
        {cancel && (
          <>
            <Field label="Reason (shown to customer)">
              {(p) => <Input {...p} value={form.cancelReason} onChange={(e) => setForm({ ...form, cancelReason: e.target.value })} placeholder="e.g. Out of stock, customer request" />}
            </Field>
            <Checkbox checked={form.restockItems} onChange={(v) => setForm({ ...form, restockItems: v })} label="Return items to stock" description="Adds the ordered quantities back to inventory" />
            {order.paymentStatus === 'paid' && (
              <Alert tone="warning">This order was paid. After cancelling, issue a refund from the order page.</Alert>
            )}
          </>
        )}
        <Field label="Internal note" hint="Optional · staff only">
          {(p) => <Textarea {...p} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />}
        </Field>
      </div>
    </Modal>
  )
}

function RefundModal({ order, onClose, onDone }) {
  const remaining = Math.round((order.total - order.refundedAmount) * 100) / 100
  const [form, setForm] = useState({ amount: String(remaining), reason: '', restockItems: order.status !== 'cancelled' })
  const m = useMutation({
    mutationFn: (body) => api.post(`/admin/orders/${order.id}/refund`, body),
    onSuccess: (o) => {
      toast.success('Refund recorded')
      onDone(o)
    },
    onError: (e) => toast.error(e.message),
  })
  const full = Number(form.amount) >= remaining
  return (
    <Modal
      open
      onClose={onClose}
      title="Issue refund"
      description={`Up to ${formatPrice(remaining, { exact: true })} can be refunded`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="danger" loading={m.isPending} onClick={() => m.mutate({ amount: Number(form.amount), reason: form.reason, restockItems: full && form.restockItems })}>
            Refund {form.amount ? formatPrice(Number(form.amount), { exact: true }) : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Amount" error={m.error?.fields?.amount}>
          {(p) => <Input {...p} type="number" min="1" step="0.01" max={remaining} prefix="₹" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />}
        </Field>
        <Field label="Reason">
          {(p) => <Input {...p} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Returned — wrong size" />}
        </Field>
        {full && order.status !== 'cancelled' && (
          <Checkbox checked={form.restockItems} onChange={(v) => setForm({ ...form, restockItems: v })} label="Return items to stock" description="Use when the frames came back in sellable condition" />
        )}
        <p className="text-xs text-muted">
          {order.paymentMethod === 'razorpay'
            ? 'The refund is sent to the customer’s original payment method through Razorpay.'
            : 'Cash-on-delivery refunds are recorded here — transfer the money to the customer by UPI or bank transfer.'}
        </p>
      </div>
    </Modal>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { isAdmin } = useAdmin()
  const [target, setTarget] = useState(null)
  const [refund, setRefund] = useState(false)
  const [note, setNote] = useState('')
  const { data: order, isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'order', id], queryFn: () => api.get(`/admin/orders/${id}`) })

  const onDone = (o) => {
    qc.setQueryData(['admin', 'order', id], (prev) => ({ ...prev, ...o }))
    qc.invalidateQueries({ queryKey: ['admin'] })
    setTarget(null)
    setRefund(false)
  }
  const addNote = useMutation({
    mutationFn: () => api.post(`/admin/orders/${id}/notes`, { note }),
    onSuccess: (o) => {
      onDone(o)
      setNote('')
    },
    onError: (e) => toast.error(e.message),
  })
  const markPaid = useMutation({
    mutationFn: () => api.post(`/admin/orders/${id}/mark-paid`, {}),
    onSuccess: (o) => {
      toast.success('Marked as paid')
      onDone(o)
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  const a = order.shippingAddress
  const forward = order.allowedTransitions.filter((s) => s !== 'cancelled')
  const canCancel = order.allowedTransitions.includes('cancelled')
  const canRefund = isAdmin && ['paid', 'partially_refunded'].includes(order.paymentStatus)
  const canMarkPaid = order.paymentStatus === 'pending' && !['cancelled', 'refunded'].includes(order.status)
  const copy = (text) => navigator.clipboard.writeText(text).then(() => toast.success('Copied'))

  return (
    <>
      <PageHeader
        back={{ to: '/admin/orders', label: 'Orders' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {order.orderNumber}
            <OrderStatusBadge status={order.status} />
            <PaymentBadge status={order.paymentStatus} />
          </span>
        }
        description={`Placed ${formatDateTime(order.createdAt)} · ${PAYMENT_METHOD[order.paymentMethod]}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Printer className="size-3.5" /> Print
            </Button>
            {canCancel && (
              <Button variant="dangerGhost" size="sm" onClick={() => setTarget('cancelled')}>
                <XCircle className="size-3.5" /> Cancel
              </Button>
            )}
            {canRefund && (
              <Button variant="secondary" size="sm" onClick={() => setRefund(true)}>
                <RotateCcw className="size-3.5" /> Refund
              </Button>
            )}
            {forward[0] && (
              <Button size="sm" onClick={() => setTarget(forward[0])}>
                {forward[0] === 'shipped' ? <Truck className="size-3.5" /> : <CheckCircle2 className="size-3.5" />} {NEXT_LABEL[forward[0]]}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card title="Fulfilment">
            <OrderProgress status={order.status} />
            {forward.length > 1 && (
              <p className="mt-5 text-xs text-muted">
                Skip ahead:{' '}
                {forward.slice(1).map((s) => (
                  <button key={s} onClick={() => setTarget(s)} className="mr-2 font-medium text-ink underline underline-offset-2">
                    {ORDER_STATUS[s].label}
                  </button>
                ))}
              </p>
            )}
            {(order.trackingNumber || order.status === 'shipped') && (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-paper px-4 py-3 text-sm">
                <span className="flex items-center gap-2"><Truck className="size-4 text-muted" /> {order.carrier || 'Carrier not set'}</span>
                {order.trackingNumber && (
                  <button onClick={() => copy(order.trackingNumber)} className="flex items-center gap-1.5 font-mono text-xs">
                    {order.trackingNumber} <Copy className="size-3 text-muted" />
                  </button>
                )}
                {['shipped'].includes(order.status) && (
                  <button onClick={() => setTarget('shipped')} className="ml-auto text-xs font-medium underline">Edit</button>
                )}
              </div>
            )}
            {order.cancelReason && <Alert tone="neutral" className="mt-5" title="Cancellation reason">{order.cancelReason}</Alert>}
          </Card>

          <Card title={`Items (${order.items.reduce((n, i) => n + i.quantity, 0)})`} padded={false}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 px-5 py-4">
                  <Thumb src={i.image} className="size-14" />
                  <div className="min-w-0 flex-1">
                    {i.productId ? (
                      <Link to={`/admin/products/${i.productId}`} className="font-medium hover:underline">{i.name}</Link>
                    ) : (
                      <p className="font-medium">{i.name} <span className="text-xs text-muted">(deleted)</span></p>
                    )}
                    <p className="text-xs text-muted">{[i.sku, i.color].filter(Boolean).join(' · ')}</p>
                  </div>
                  <p className="text-sm tabular-nums text-muted">{formatPrice(i.unitPrice)} × {i.quantity}</p>
                  <p className="w-24 text-right font-medium tabular-nums">{formatPrice(i.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              {order.discountTotal > 0 && <div className="flex justify-between"><dt className="text-muted">Discount ({order.discountCode})</dt><dd className="tabular-nums text-success">−{formatPrice(order.discountTotal, { exact: true })}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tabular-nums">{order.shippingTotal ? formatPrice(order.shippingTotal) : 'Free'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax (included)</dt><dd className="tabular-nums">{formatPrice(order.taxTotal, { exact: true })}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total, { exact: true })}</dd></div>
              {order.refundedAmount > 0 && <div className="flex justify-between text-danger"><dt>Refunded</dt><dd className="tabular-nums">−{formatPrice(order.refundedAmount, { exact: true })}</dd></div>}
            </dl>
          </Card>

          <Card title="Timeline">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (note.trim()) addNote.mutate()
              }}
              className="mb-6 flex gap-2"
            >
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note…" aria-label="Internal note" />
              <Button type="submit" variant="secondary" loading={addNote.isPending} disabled={!note.trim()}>
                <MessageSquare className="size-3.5" /> Add
              </Button>
            </form>
            <ol className="space-y-5 border-l border-line pl-5">
              {[...order.events].reverse().map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn('absolute -left-[25px] top-1 size-2.5 rounded-full ring-4 ring-white', e.isPublic ? 'bg-ink' : 'bg-line-strong')} />
                  <p className="text-sm">{e.message}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(e.createdAt)}
                    {e.by && ` · ${e.by}`}
                    {!e.isPublic && ' · internal'}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Customer" actions={order.customer && <Link to={`/admin/customers/${order.customer.id}`} className="text-xs font-medium text-muted hover:text-ink">Profile</Link>}>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-medium"><User className="size-4 text-muted" /> {order.customerName}</p>
              <a href={`mailto:${order.email}`} className="flex items-center gap-2 hover:underline"><Mail className="size-4 text-muted" /> {order.email}</a>
              <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:underline"><Phone className="size-4 text-muted" /> {order.phone}</a>
              {order.customer && (
                <p className="rounded-xl bg-paper px-3 py-2 text-xs text-muted">
                  {order.customer.orderCount} orders · {formatPrice(order.customer.totalSpent)} lifetime · {order.customer.hasAccount ? 'Registered' : 'Guest'}
                </p>
              )}
            </div>
          </Card>
          <Card title="Shipping address" actions={<button onClick={() => copy(`${order.customerName}\n${a.line1}${a.line2 ? `, ${a.line2}` : ''}\n${a.city}, ${a.state} ${a.postalCode}\n${order.phone}`)} className="text-muted hover:text-ink" aria-label="Copy address"><Copy className="size-3.5" /></button>}>
            <address className="flex gap-2 text-sm not-italic leading-relaxed">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
              <span>
                {a.line1}
                {a.line2 && <><br />{a.line2}</>}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country}
              </span>
            </address>
            {order.customerNote && <p className="mt-4 rounded-xl bg-accent-soft px-3 py-2 text-xs text-accent-ink">“{order.customerNote}”</p>}
          </Card>
          <Card title="Payment">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Method</dt><dd>{PAYMENT_METHOD[order.paymentMethod]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><PaymentBadge status={order.paymentStatus} /></dd></div>
              {order.paymentRef && <div className="flex justify-between gap-2"><dt className="text-muted">Gateway order</dt><dd className="truncate font-mono text-xs">{order.paymentRef}</dd></div>}
              {order.paymentTxnId && <div className="flex justify-between gap-2"><dt className="text-muted">Transaction</dt><dd className="truncate font-mono text-xs">{order.paymentTxnId}</dd></div>}
            </dl>
            {canMarkPaid && (
              <Button variant="secondary" size="sm" full className="mt-4" loading={markPaid.isPending} onClick={() => markPaid.mutate()}>
                <BadgeIndianRupee className="size-3.5" /> Mark as paid
              </Button>
            )}
            {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
              <p className="mt-2 text-xs text-muted">COD orders are marked paid automatically when delivered.</p>
            )}
          </Card>
        </div>
      </div>

      {target && <StatusModal order={order} target={target} onClose={() => setTarget(null)} onDone={onDone} />}
      {refund && <RefundModal order={order} onClose={() => setRefund(false)} onDone={onDone} />}
    </>
  )
}
