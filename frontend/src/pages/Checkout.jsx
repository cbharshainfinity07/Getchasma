import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, ChevronLeft, CreditCard, Banknote, ShoppingBag, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCartQuote, INDIAN_STATES } from '../lib/useQuote'
import { useSettings } from '../lib/queries'
import { api } from '../lib/api'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { EmptyState, Alert } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import { DiscountForm, Totals } from '../components/cart/OrderSummary'
import { cn, formatPrice } from '../lib/format'

const EMPTY = { customerName: '', email: '', phone: '', line1: '', line2: '', city: '', state: 'Karnataka', postalCode: '', customerNote: '' }

function validate(v) {
  const e = {}
  if (v.customerName.trim().length < 2) e.customerName = 'Enter your full name'
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address'
  if (!/^[+\d][\d\s-]{6,18}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number'
  if (v.line1.trim().length < 3) e['shippingAddress.line1'] = 'Enter your street address'
  if (v.city.trim().length < 2) e['shippingAddress.city'] = 'Enter your city'
  if (!v.state) e['shippingAddress.state'] = 'Choose your state'
  if (!/^\d{6}$/.test(v.postalCode.trim())) e['shippingAddress.postalCode'] = 'Enter a valid 6-digit PIN code'
  return e
}

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(window.Razorpay)
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'))
    document.body.appendChild(s)
  })
}

const METHOD_ICON = { razorpay: CreditCard, cod: Banknote }

export default function Checkout() {
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const { data: settings } = useSettings()
  const { quote, discount } = useCartQuote()
  const navigate = useNavigate()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [method, setMethod] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (user) setValues((v) => ({ ...v, customerName: v.customerName || user.name, email: v.email || user.email, phone: v.phone || user.phone || '' }))
  }, [user])

  const methods = useMemo(() => quote.data?.paymentMethods || [], [quote.data])
  useEffect(() => {
    if (!methods.length) return
    const current = methods.find((m) => m.id === method)
    if (!current?.available) setMethod(methods.find((m) => m.available)?.id || null)
  }, [methods, method])

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined, [`shippingAddress.${k}`]: undefined }))
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="pt-32">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Add a few frames before checking out." action={<Button to="/shop">Shop eyewear</Button>} />
      </div>
    )
  }

  const finish = (orderNumber, email) => {
    sessionStorage.setItem('gc_last_order', JSON.stringify({ orderNumber, email }))
    clearCart()
    navigate(`/order/${orderNumber}`, { replace: true })
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormError(null)
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) {
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    if (!method) {
      setFormError('Choose a payment method')
      return
    }
    setSubmitting(true)
    const body = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })),
      discountCode: quote.data?.discountCode || null,
      customerName: values.customerName,
      email: values.email,
      phone: values.phone,
      shippingAddress: { line1: values.line1, line2: values.line2, city: values.city, state: values.state, postalCode: values.postalCode, country: 'India' },
      paymentMethod: method,
      customerNote: values.customerNote,
    }
    try {
      const res = await api.post('/checkout', body)
      if (method === 'razorpay') {
        if (res.paymentError || !res.payment) {
          toast.error(res.paymentError || 'Online payment could not be started')
          finish(res.orderNumber, res.email)
          return
        }
        const Razorpay = await loadRazorpay()
        const rzp = new Razorpay({
          key: res.payment.keyId,
          order_id: res.payment.razorpayOrderId,
          amount: res.payment.amount,
          currency: res.payment.currency,
          name: settings?.store?.name || 'GetChasma',
          description: `Order ${res.orderNumber}`,
          prefill: { name: values.customerName, email: values.email, contact: values.phone },
          theme: { color: '#0a0a0b' },
          handler: async (r) => {
            try {
              await api.post('/checkout/razorpay/verify', {
                orderNumber: res.orderNumber,
                razorpayOrderId: r.razorpay_order_id,
                razorpayPaymentId: r.razorpay_payment_id,
                razorpaySignature: r.razorpay_signature,
              })
            } catch (err) {
              toast.error(err.message)
            }
            finish(res.orderNumber, res.email)
          },
          modal: {
            ondismiss: () => {
              toast('Payment not completed', { description: 'Your order is saved. Contact us to complete payment.' })
              finish(res.orderNumber, res.email)
            },
          },
        })
        rzp.open()
        return
      }
      finish(res.orderNumber, res.email)
    } catch (err) {
      setSubmitting(false)
      if (err.problems?.length) {
        setFormError(err.problems.map((p) => p.message).join(' · '))
        quote.refetch()
      } else if (Object.keys(err.fields).length) {
        setErrors(err.fields)
        setFormError(err.message)
      } else {
        setFormError(err.message)
      }
    }
  }

  const err = (k) => errors[k] || errors[`shippingAddress.${k}`]
  const problems = quote.data?.problems || []

  return (
    <div className="min-h-screen bg-paper pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft className="size-4" /> Back to bag
        </Link>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.045em] md:text-5xl">Checkout</h1>

        <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="space-y-6">
            {/* Contact */}
            <section className=" bg-white p-6 shadow-card md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold"><span className="mr-2 text-subtle">01</span>Contact</h2>
                {!user && (
                  <Link to="/account/login?next=/checkout" className="text-sm font-medium underline underline-offset-4">
                    Sign in
                  </Link>
                )}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required error={err('customerName')} className="sm:col-span-2">
                  {(p) => <Input {...p} autoComplete="name" value={values.customerName} onChange={set('customerName')} error={err('customerName')} />}
                </Field>
                <Field label="Email" required error={err('email')} help="Order updates are sent here">
                  {(p) => <Input {...p} type="email" autoComplete="email" value={values.email} onChange={set('email')} error={err('email')} />}
                </Field>
                <Field label="Phone" required error={err('phone')} help="For delivery coordination">
                  {(p) => <Input {...p} type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set('phone')} error={err('phone')} placeholder="+91" />}
                </Field>
              </div>
            </section>

            {/* Shipping */}
            <section className=" bg-white p-6 shadow-card md:p-8">
              <h2 className="text-lg font-semibold"><span className="mr-2 text-subtle">02</span>Shipping address</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-6">
                <Field label="Address" required error={err('line1')} className="sm:col-span-6">
                  {(p) => <Input {...p} autoComplete="address-line1" value={values.line1} onChange={set('line1')} error={err('line1')} placeholder="House no., street, area" />}
                </Field>
                <Field label="Apartment, landmark" hint="Optional" className="sm:col-span-6">
                  {(p) => <Input {...p} autoComplete="address-line2" value={values.line2} onChange={set('line2')} />}
                </Field>
                <Field label="City" required error={err('city')} className="sm:col-span-2">
                  {(p) => <Input {...p} autoComplete="address-level2" value={values.city} onChange={set('city')} error={err('city')} />}
                </Field>
                <Field label="State" required error={err('state')} className="sm:col-span-2">
                  {(p) => (
                    <Select {...p} autoComplete="address-level1" value={values.state} onChange={set('state')} error={err('state')}>
                      {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="PIN code" required error={err('postalCode')} className="sm:col-span-2">
                  {(p) => <Input {...p} autoComplete="postal-code" inputMode="numeric" maxLength={6} value={values.postalCode} onChange={set('postalCode')} error={err('postalCode')} />}
                </Field>
                <Field label="Delivery note" hint="Optional" className="sm:col-span-6">
                  {(p) => <Textarea {...p} rows={2} value={values.customerNote} onChange={set('customerNote')} placeholder="Anything we should know?" />}
                </Field>
              </div>
              {settings?.shipping?.estimatedDelivery && (
                <p className="mt-5 text-xs text-muted">Ships across {settings.shipping.shipsTo}. Estimated delivery: {settings.shipping.estimatedDelivery}.</p>
              )}
            </section>

            {/* Payment */}
            <section className=" bg-white p-6 shadow-card md:p-8">
              <h2 className="text-lg font-semibold"><span className="mr-2 text-subtle">03</span>Payment</h2>
              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Payment method">
                {methods.map((m) => {
                  const Icon = METHOD_ICON[m.id] || CreditCard
                  const active = method === m.id
                  return (
                    <label
                      key={m.id}
                      className={cn(
                        'flex items-start gap-4 rounded-2xl border p-4 transition',
                        !m.available ? 'cursor-not-allowed border-line bg-paper/60 opacity-60' : active ? 'cursor-pointer border-ink ring-1 ring-ink' : 'cursor-pointer border-line-strong hover:border-subtle',
                      )}
                    >
                      <input type="radio" name="payment" className="sr-only" checked={active} disabled={!m.available} onChange={() => setMethod(m.id)} />
                      <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border', active ? 'border-ink' : 'border-line-strong')}>
                        {active && <span className="size-2.5 rounded-full bg-ink" />}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon className="size-4" /> {m.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{m.available ? m.description : m.reason}</span>
                      </span>
                    </label>
                  )
                })}
                {!methods.length && <p className="text-sm text-muted">Loading payment options…</p>}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className=" bg-white p-6 shadow-card md:p-8">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
                {(quote.data?.items || items).map((i) => {
                  const problem = problems.find((p) => p.productId === i.productId)
                  return (
                    <li key={`${i.productId}-${i.color}`} className="flex gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                        <img src={i.image} alt="" className="size-full object-cover" />
                        <span className="absolute -right-0 -top-0 flex size-5 items-center justify-center rounded-bl-lg bg-ink text-[10px] font-bold text-white">{i.quantity}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.name}</p>
                        {i.color && <p className="text-xs text-muted">{i.color}</p>}
                        {problem && <p className="mt-0.5 text-xs text-danger">{problem.message}</p>}
                      </div>
                      <p className="text-sm font-medium">{formatPrice(i.lineTotal ?? i.price * i.quantity)}</p>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-6 border-t border-line pt-6">
                <DiscountForm applied={discount.applied} onApply={discount.apply} onRemove={discount.remove} error={discount.error} loading={discount.loading} />
              </div>
              <Totals quote={quote.data} loading={quote.isFetching} className="mt-6" />

              {formError && (
                <Alert tone="danger" className="mt-5" icon={AlertCircle}>
                  {formError}
                </Alert>
              )}
              {problems.length > 0 && (
                <Alert tone="warning" className="mt-5">
                  Some items are unavailable. <Link to="/cart" className="font-medium underline">Update your bag</Link> to continue.
                </Alert>
              )}

              <Button type="submit" variant="primary" size="lg" full className="mt-6" loading={submitting} disabled={!quote.data || problems.length > 0 || !method}>
                <Lock className="size-4" />
                {method === 'razorpay' ? 'Pay' : 'Place order'} {quote.data && `· ${formatPrice(quote.data.total)}`}
              </Button>
              <p className="mt-4 text-center text-xs leading-relaxed text-muted">
                By placing your order you agree to our <Link to="/help/terms" className="underline">terms</Link> and{' '}
                <Link to="/help/privacy" className="underline">privacy policy</Link>.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}
