import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Check, Truck, RotateCcw, Glasses, Banknote } from 'lucide-react'
import { useProducts, useSettings } from '../../lib/queries'
import { api } from '../../lib/api'
import { cn, formatPrice } from '../../lib/format'
import { Stars } from '../ui/Commerce'
import ProductCard, { ProductCardSkeleton } from '../product/ProductCard'
import SectionHeader from './SectionHeader'

const EASE = [0.16, 1, 0.3, 1]

/** Campaign lookbook: expanding image strips. Each look links to the frames that create it. */
export function Lookbook() {
  const { data: settings } = useSettings()
  const reduce = useReducedMotion()
  const looks = [
    { img: '/hot-1.jpg', title: 'Sunset tints', note: 'Amber acetate, warm lenses', to: '/shop?colors=Amber' },
    { img: '/hot-3.jpg', title: 'Pilot minis', note: 'Compact gold metal frames', to: '/shop?shapes=Aviator' },
    { img: '/hot-5.jpg', title: 'Noir edit', note: 'Slim black rectangles', to: '/shop?colors=Black' },
    { img: '/hot-2.jpg', title: 'Street square', note: 'Bold tinted squares', to: '/shop?shapes=Square' },
    { img: '/special.png', title: 'Tag your look', note: 'Get featured on our feed', href: settings?.store?.instagram },
  ]
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-white py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader eyebrow="The lookbook" title="Wear it" accent="your way." />
        <div className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:h-[600px] lg:overflow-visible lg:px-0">
          {looks.map((l, i) => {
            const active = open === i
            const Tag = l.to ? Link : 'a'
            const linkProps = l.to ? { to: l.to } : { href: l.href || '#', target: '_blank', rel: 'noreferrer' }
            return (
              <motion.div
                key={l.title}
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                className={cn(
                  'relative w-[78vw] shrink-0 snap-start overflow-hidden bg-paper sm:w-[46vw] lg:w-auto lg:shrink',
                  'h-[520px] lg:h-full lg:transition-[flex-grow] lg:duration-700 lg:ease-[cubic-bezier(0.16,1,0.3,1)]',
                  active ? 'lg:flex-[4]' : 'lg:flex-[1]',
                )}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
              >
                <Tag {...linkProps} className="group absolute inset-0 block" aria-label={l.title}>
                  <img src={l.img} alt="" loading="lazy" className="size-full object-cover transition duration-[1400ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-coal/80 via-coal/5 to-transparent" />
                  <div className={cn('absolute inset-x-0 bottom-0 p-6 text-snow transition-opacity duration-500 md:p-8', active ? 'opacity-100' : 'lg:opacity-0')}>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-display text-3xl font-normal md:text-4xl">{l.title}</h3>
                        <p className="mt-1 text-sm text-snow/75">{l.note}</p>
                      </div>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </div>
                  </div>
                  <p
                    className={cn(
                      'absolute bottom-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-lg font-semibold text-snow transition-opacity duration-300 [writing-mode:vertical-rl] lg:block',
                      active ? 'opacity-0' : 'opacity-100',
                    )}
                    aria-hidden
                  >
                    {l.title}
                  </p>
                </Tag>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Tabbed product grid: one place for new arrivals, offers and budget picks. */
export function ProductTabs() {
  const tabs = [
    { key: 'new', label: 'New in', query: { sort: 'newest' }, link: '/shop?sort=newest' },
    { key: 'sale', label: 'On sale', query: { onSale: true, inStock: true, sort: 'popular' }, link: '/shop?onSale=true' },
    { key: 'under', label: `Under ${formatPrice(3000)}`, query: { maxPrice: 3000, sort: 'price_asc' }, link: '/shop?maxPrice=3000' },
  ]
  const [tab, setTab] = useState('new')
  const t = tabs.find((x) => x.key === tab)
  const { data, isLoading, isFetching } = useProducts({ ...t.query, limit: 4 })
  const items = data?.items || []

  return (
    <section className="bg-white pb-24 md:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader title="Fresh picks," accent="every week." link={t.link} linkLabel={`Shop ${t.label.toLowerCase()}`}>
          <div className="flex gap-6 border-b border-line" role="tablist" aria-label="Product collections">
            {tabs.map((x) => (
              <button
                key={x.key}
                role="tab"
                aria-selected={tab === x.key}
                onClick={() => setTab(x.key)}
                className={cn(
                  'relative whitespace-nowrap pb-3 text-[11px] font-medium uppercase tracking-[0.2em] transition',
                  tab === x.key ? 'text-ink' : 'text-subtle hover:text-ink',
                )}
              >
                {x.label}
                {tab === x.key && <motion.span layoutId="tab-line" className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              </button>
            ))}
          </div>
        </SectionHeader>
        <div className={cn('grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity md:gap-x-6 lg:grid-cols-4', isFetching && !isLoading && 'opacity-60')}>
          {(isLoading ? Array.from({ length: 4 }) : items).map((p, i) => (p ? <ProductCard key={`${tab}-${p.id}`} product={p} /> : <ProductCardSkeleton key={i} />))}
        </div>
        {!isLoading && !items.length && <p className="py-16 text-center text-muted">Nothing here right now. Check back soon.</p>}
      </div>
    </section>
  )
}

/** Reviews: one large quote at a time, auto-advancing. Content is managed in Admin, Settings, Testimonials. */
export function Reviews() {
  const { data: settings } = useSettings()
  const reduce = useReducedMotion()
  const items = settings?.testimonials || []
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2 || reduce) return
    const t = setTimeout(() => setI((n) => (n + 1) % items.length), 6500)
    return () => clearTimeout(t)
  }, [i, items.length, reduce])
  if (!items.length) return null
  const r = items[i % items.length]
  const go = (d) => setI((n) => (n + d + items.length) % items.length)

  return (
    <section className="bg-white pb-24 md:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="relative overflow-hidden bg-paper p-8 ring-1 ring-line md:p-16 lg:p-20">
          <div className="relative grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-4xl font-normal leading-[0.95] md:text-5xl">
                Seen through <span className="italic">their eyes.</span>
              </h2>
              <div className="mt-8 flex items-center gap-2">
                <button onClick={() => go(-1)} className="flex size-11 items-center justify-center rounded-full border border-line-strong transition hover:border-ink" aria-label="Previous review">
                  <ChevronLeft className="size-4" />
                </button>
                <button onClick={() => go(1)} className="flex size-11 items-center justify-center rounded-full border border-line-strong transition hover:border-ink" aria-label="Next review">
                  <ChevronRight className="size-4" />
                </button>
                <span className="ml-3 text-sm tabular-nums text-muted">
                  {(i % items.length) + 1} of {items.length}
                </span>
              </div>
            </div>
            <div className="min-h-[220px] lg:col-span-8" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <Stars rating={r.rating} className="[&_svg]:size-4" />
                  <blockquote className="mt-6 font-display text-2xl font-medium leading-snug text-ink md:text-4xl md:leading-[1.15]">“{r.quote}”</blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    <span className="flex size-12 items-center justify-center rounded-full bg-ink font-display text-lg italic text-white">{r.name.charAt(0)}</span>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-sm text-muted">{[r.location, r.product && `Bought ${r.product}`].filter(Boolean).join(', ')}</p>
                    </div>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Service promise strip, values pulled from store settings where applicable. */
export function ServicePromise() {
  const { data: settings } = useSettings()
  const threshold = settings?.shipping?.freeThreshold
  const items = [
    { icon: Truck, title: 'Free shipping', text: threshold ? `On orders above ${formatPrice(threshold)}` : 'Tracked delivery across India' },
    { icon: RotateCcw, title: '7-day returns', text: 'Not the one? Send it back' },
    { icon: Glasses, title: 'Prescription ready', text: 'Optical frames take your power' },
    { icon: Banknote, title: 'Cash on delivery', text: 'Pay when it reaches you' },
  ]
  return (
    <section className="bg-white pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden bg-line ring-1 ring-line lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex flex-col gap-4 bg-white p-6 md:p-8">
            <Icon className="size-6 text-ink" strokeWidth={1.6} />
            <div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}

/** Closing call to action: the newsletter panel. Subscribers are stored in the database. */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const reduce = useReducedMotion()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setState('loading')
    try {
      const res = await api.post('/newsletter', { email })
      setState('done')
      toast.success(res.alreadySubscribed ? 'You are already on the list' : 'Welcome to the GetChasma list')
    } catch (err) {
      setState('idle')
      setError(err.fields?.email || err.message)
    }
  }

  return (
    <section className="bg-white pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative grid overflow-hidden bg-paper text-ink lg:grid-cols-2"
        >
          <div className="p-8 md:p-14 lg:p-16">
            <h2 className="text-[2.6rem] font-normal leading-[0.92] sm:text-6xl">First look at every new frame.</h2>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted">Early access to drops and members-only offers. One email a fortnight, unsubscribe anytime.</p>
            {state === 'done' ? (
              <p className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                <Check className="size-4" /> You are subscribed. Watch your inbox.
              </p>
            ) : (
              <form onSubmit={submit} className="mt-10 max-w-md" noValidate>
                <label htmlFor="newsletter-email" className="mb-2 block text-sm font-semibold">Email address</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'newsletter-error' : undefined}
                    className="h-13 flex-1 border border-line-strong bg-white px-5 text-[15px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="group inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap bg-ink px-7 text-[12px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-ink-soft active:scale-[0.98] disabled:opacity-60"
                  >
                    {state === 'loading' ? 'Joining…' : 'Subscribe'}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </button>
                </div>
                {error && <p id="newsletter-error" className="mt-2 text-sm font-medium text-red-800" role="alert">{error}</p>}
              </form>
            )}
          </div>
          <div className="relative hidden min-h-[420px] lg:block">
            <img src="/hot-4.jpg" alt="Model wearing GetChasma sunglasses" loading="lazy" className="absolute inset-0 size-full object-cover" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
