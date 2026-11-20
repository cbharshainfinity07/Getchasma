import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { CheckCircle2, PackageSearch } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import OrderView from '../components/order/OrderView'
import { Field, Input } from '../components/ui/Field'
import { PageLoader, EmptyState, Alert } from '../components/ui/Feedback'
import Button from '../components/ui/Button'

/** Shown right after checkout. Looks the order up with the order number + email kept in this tab's session. */
export function OrderConfirmation() {
  const { orderNumber } = useParams()
  const { user } = useAuth()
  const saved = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('gc_last_order') || 'null')
    } catch {
      return null
    }
  })()
  const canTrack = saved?.orderNumber === orderNumber
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-confirmation', orderNumber],
    queryFn: () =>
      canTrack
        ? api.post('/orders/track', { orderNumber, email: saved.email })
        : api.get(`/account/orders/${orderNumber}`),
    enabled: canTrack || Boolean(user),
    retry: false,
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="min-h-screen bg-paper pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-10 text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            className="mx-auto flex size-16 items-center justify-center rounded-full bg-ink text-white"
          >
            <CheckCircle2 className="size-8" />
          </motion.span>
          <h1 className="mt-6 font-display text-4xl font-normal tracking-[-0.045em] md:text-5xl">
            Thank you{order ? `, ${order.customerName.split(' ')[0]}` : ''}!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
            Your order <strong className="text-ink">{orderNumber}</strong> has been placed. We’ll send updates to {order?.email || 'your email'}.
          </p>
        </motion.div>
        {order ? (
          <>
            {order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && (
              <Alert tone="warning" title="Payment pending" className="mb-6">
                We haven’t received your online payment yet. If money was deducted it will be reconciled automatically. Otherwise, contact us to complete payment.
              </Alert>
            )}
            <OrderView order={order} />
          </>
        ) : (
          isError && (
            <Alert tone="info" title="Order details">
              Use <Link to="/track" className="font-medium underline">Track order</Link> with your order number and email to see the latest status.
            </Alert>
          )
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/shop">Continue shopping</Button>
          <Button variant="secondary" to={user ? '/account' : '/track'}>{user ? 'View my orders' : 'Track this order'}</Button>
        </div>
      </div>
    </div>
  )
}

/** Guest order tracking by order number + email. */
export function TrackOrder() {
  const [form, setForm] = useState({ orderNumber: '', email: '' })
  const track = useMutation({ mutationFn: (body) => api.post('/orders/track', body) })

  return (
    <div className="min-h-screen bg-paper pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-display text-4xl font-normal tracking-[-0.045em] md:text-5xl">
            Track your <span className="italic">order</span>
          </h1>
          <p className="mt-3 text-[15px] text-muted">Enter the order number from your confirmation and the email you used at checkout.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            track.mutate({ orderNumber: form.orderNumber.trim(), email: form.email.trim() })
          }}
          className="mx-auto mt-10 grid max-w-xl gap-4 bg-white p-6 shadow-card sm:grid-cols-2 md:p-8"
        >
          <Field label="Order number" required>
            {(p) => <Input {...p} required placeholder="GC-XXXXXXXX" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} className="uppercase" />}
          </Field>
          <Field label="Email" required>
            {(p) => <Input {...p} required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
          </Field>
          <Button type="submit" loading={track.isPending} className="sm:col-span-2" full>
            <PackageSearch className="size-4" /> Track order
          </Button>
          {track.isError && <p className="text-sm text-danger sm:col-span-2" role="alert">{track.error.message}</p>}
        </form>
        {track.data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            <OrderView order={track.data} />
          </motion.div>
        )}
        {!track.data && !track.isPending && (
          <EmptyState compact icon={PackageSearch} title="Have an account?" description="Signed-in customers can see every order in one place." action={<Button variant="secondary" size="sm" to="/account">Go to my account</Button>} />
        )}
      </div>
    </div>
  )
}
