import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Package, LogOut, ChevronRight, ChevronLeft } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Field, Input } from '../components/ui/Field'
import { PageLoader, EmptyState, ErrorState, Badge } from '../components/ui/Feedback'
import { ConfirmDialog } from '../components/ui/Overlay'
import Button from '../components/ui/Button'
import OrderView from '../components/order/OrderView'
import { cn, formatDate, formatPrice, ORDER_STATUS } from '../lib/format'

export function AuthPage() {
  const { user, login, register } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const next = params.get('next')?.startsWith('/') ? params.get('next') : '/account'
  const m = mode === 'login' ? login : register

  if (user) return <Navigate to={next} replace />

  const fieldErr = (k) => m.error?.fields?.[k]
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const body = mode === 'login' ? { email: form.email, password: form.password } : form
    m.mutate(body, {
      onSuccess: (d) => {
        toast.success(mode === 'login' ? `Welcome back, ${d.user.name.split(' ')[0]}` : 'Account created')
        navigate(next, { replace: true })
      },
    })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-black lg:block">
        <img src="/hot-3.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-snow">
          <p className="font-display text-4xl font-bold leading-tight tracking-[-0.04em]">
            Your frames, your orders, <span className="italic">your style.</span>
          </p>
          <p className="mt-3 text-snow/60">Track deliveries, save favourites and check out faster.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 pb-24 pt-28">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex rounded-full bg-paper p-1 text-sm font-medium" role="tablist">
            {['login', 'register'].map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={mode === k}
                onClick={() => {
                  setMode(k)
                  m.reset()
                }}
                className={cn('flex-1 rounded-full py-2.5 transition', mode === k ? 'bg-white shadow-card' : 'text-muted')}
              >
                {k === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <h1 className="font-display text-3xl font-normal tracking-[-0.04em]">{mode === 'login' ? 'Welcome back' : 'Join GetChasma'}</h1>
          <p className="mt-2 text-sm text-muted">{mode === 'login' ? 'Sign in to see your orders and wishlist.' : 'Create an account to track orders and save favourites.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {mode === 'register' && (
              <>
                <Field label="Full name" required error={fieldErr('name')}>
                  {(p) => <Input {...p} autoComplete="name" value={form.name} onChange={set('name')} error={fieldErr('name')} />}
                </Field>
                <Field label="Phone" hint="Optional" error={fieldErr('phone')}>
                  {(p) => <Input {...p} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={fieldErr('phone')} />}
                </Field>
              </>
            )}
            <Field label="Email" required error={fieldErr('email')}>
              {(p) => <Input {...p} type="email" autoComplete="email" value={form.email} onChange={set('email')} error={fieldErr('email')} />}
            </Field>
            <Field label="Password" required error={fieldErr('password')} help={mode === 'register' ? 'At least 8 characters' : undefined}>
              {(p) => (
                <Input {...p} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} error={fieldErr('password')} />
              )}
            </Field>
            {m.isError && !Object.keys(m.error.fields || {}).length && (
              <p className="text-sm text-danger" role="alert">{m.error.message}</p>
            )}
            <Button type="submit" full size="lg" loading={m.isPending}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            Just want to check an order? <Link to="/track" className="font-medium text-ink underline">Track it here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ user }) {
  const { setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' })
  const save = useMutation({
    mutationFn: (b) => api.put('/account/profile', b),
    onSuccess: (d) => {
      setUser(d.user)
      toast.success('Profile updated')
    },
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate(form)
      }}
      className="space-y-4 bg-white p-6 shadow-card"
    >
      <h2 className="font-semibold">Profile</h2>
      <Field label="Name" error={save.error?.fields?.name}>
        {(p) => <Input {...p} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      </Field>
      <Field label="Phone" error={save.error?.fields?.phone}>
        {(p) => <Input {...p} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
      </Field>
      <p className="text-xs text-muted">Email: {user.email}</p>
      <Button type="submit" size="sm" variant="secondary" loading={save.isPending}>Save changes</Button>
    </form>
  )
}

export function AccountHome() {
  const { user, isLoading, logout } = useAuth()
  const orders = useQuery({ queryKey: ['account', 'orders'], queryFn: () => api.get('/account/orders'), enabled: Boolean(user) })
  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/account/login" replace />

  return (
    <div className="min-h-screen bg-paper pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">My account</p>
            <h1 className="font-display text-4xl font-normal tracking-[-0.045em] md:text-5xl">Hi, {user.name.split(' ')[0]}</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={() => logout.mutate()} loading={logout.isPending}>
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className=" bg-white p-6 shadow-card md:p-8">
            <h2 className="font-semibold">Order history</h2>
            {orders.isLoading ? (
              <PageLoader />
            ) : orders.isError ? (
              <ErrorState error={orders.error} onRetry={orders.refetch} />
            ) : orders.data.length === 0 ? (
              <EmptyState compact icon={Package} title="No orders yet" description="When you place an order it will show up here." action={<Button size="sm" to="/shop">Start shopping</Button>} />
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {orders.data.map((o) => (
                  <li key={o.id}>
                    <Link to={`/account/orders/${o.orderNumber}`} className="-mx-3 flex items-center gap-4 rounded-2xl px-3 py-4 transition hover:bg-paper">
                      <div className="flex -space-x-3">
                        {o.previews.slice(0, 3).map((p, i) => (
                          <div key={i} className="size-12 overflow-hidden rounded-xl bg-paper ring-2 ring-white">
                            {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
                          </div>
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{o.orderNumber}</p>
                        <p className="text-xs text-muted">
                          {formatDate(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'} · {formatPrice(o.total)}
                        </p>
                      </div>
                      <Badge tone={ORDER_STATUS[o.status].tone} dot>{ORDER_STATUS[o.status].label}</Badge>
                      <ChevronRight className="size-4 text-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <aside className="space-y-6">
            <ProfileCard user={user} />
            <div className=" bg-white p-6 shadow-card">
              <h2 className="font-semibold">Quick links</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="hover:underline" to="/wishlist">My wishlist</Link></li>
                <li><Link className="hover:underline" to="/help/shipping-returns">Shipping & returns</Link></li>
                <li><Link className="hover:underline" to="/help/faq">Help & FAQ</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function AccountOrder() {
  const { orderNumber } = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const qc = useQueryClient()
  const [confirm, setConfirm] = useState(false)
  const order = useQuery({ queryKey: ['account', 'order', orderNumber], queryFn: () => api.get(`/account/orders/${orderNumber}`), enabled: Boolean(user) })
  const cancel = useMutation({
    mutationFn: () => api.post(`/account/orders/${orderNumber}/cancel`, {}),
    onSuccess: (d) => {
      qc.setQueryData(['account', 'order', orderNumber], d)
      qc.invalidateQueries({ queryKey: ['account', 'orders'] })
      setConfirm(false)
      toast.success('Order cancelled')
    },
    onError: (e) => toast.error(e.message),
  })

  if (authLoading) return <PageLoader />
  if (!user) return <Navigate to={`/account/login?next=/account/orders/${orderNumber}`} replace />

  return (
    <div className="min-h-screen bg-paper pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <Link to="/account" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft className="size-4" /> All orders
        </Link>
        {order.isLoading ? (
          <PageLoader />
        ) : order.isError ? (
          <ErrorState error={order.error} onRetry={order.refetch} />
        ) : (
          <OrderView
            order={order.data}
            actions={
              ['pending', 'confirmed'].includes(order.data.status) && (
                <Button variant="dangerGhost" size="sm" onClick={() => setConfirm(true)}>Cancel order</Button>
              )
            }
          />
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => cancel.mutate()}
        loading={cancel.isPending}
        title="Cancel this order?"
        description="Items will be released back to stock. If you paid online, our team will refund you to your original payment method."
        confirmLabel="Yes, cancel order"
      />
    </div>
  )
}
