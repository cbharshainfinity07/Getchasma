import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight, ArrowRight, ShieldCheck, Sun, Feather, Ruler } from 'lucide-react'
import { useCategories, useProducts } from '../../lib/queries'
import { formatPrice, cn } from '../../lib/format'
import { useCart } from '../../context/CartContext'
import ProductCard, { ProductCardSkeleton } from '../product/ProductCard'
import { Skeleton } from '../ui/Feedback'
import SectionHeader from './SectionHeader'

const EASE = [0.16, 1, 0.3, 1]

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/** The page's single marquee: a quiet hairline band of material and lens words. */
export function Marquee() {
  const words = ['Polarised lenses', 'Pure titanium', 'Italian acetate', 'UV400 protection', 'Blue-cut lenses', 'Prescription ready']
  const row = [...words, ...words]
  return (
    <div className="overflow-hidden border-y border-line bg-white py-5 text-ink" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap motion-reduce:animate-none">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-xl italic md:text-2xl">
            {w}
            <span className="inline-block size-1 rounded-full bg-ink/40" />
          </span>
        ))}
      </div>
    </div>
  )
}

/** Category bento: one hero tile, two stacked, one wide banner. Cell count follows the data (max 4). */
export function Collections() {
  const { data: categories = [], isLoading } = useCategories()
  const reduce = useReducedMotion()
  const items = categories.slice(0, 4)
  if (!isLoading && !items.length) return null
  const spans = [
    'col-span-2 row-span-2 md:col-span-7 md:row-span-2',
    'col-span-1 md:col-span-5',
    'col-span-1 md:col-span-5',
    'col-span-2 md:col-span-12',
  ]
  return (
    <section id="collections" className="scroll-mt-20 bg-white pb-24 md:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader title="Shop by" accent="collection" link="/shop" linkLabel="All eyewear" />
        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[270px] md:grid-cols-12 md:gap-4">
          {(isLoading ? Array.from({ length: 4 }) : items).map((c, i) =>
            !c ? (
              <Skeleton key={i} className={cn('', spans[i])} />
            ) : (
              <motion.div
                key={c.id}
                className={spans[i]}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
              >
                <Link to={`/shop/${c.slug}`} className="group relative block size-full overflow-hidden bg-paper ring-1 ring-line">
                  <img src={c.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-coal/80 via-coal/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-snow md:p-7">
                    <div>
                      <h3 className={cn('font-display font-normal tracking-tight', i === 0 ? 'text-4xl md:text-6xl' : 'text-2xl md:text-3xl')}>{c.name}</h3>
                      <p className="mt-1 text-sm text-snow/70">{c.productCount} styles</p>
                      {i === 0 && c.description && <p className="mt-3 hidden max-w-sm text-sm text-snow/75 md:block">{c.description}</p>}
                    </div>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-snow/15 text-snow backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-ink">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Best sellers as a scroll-driven horizontal gallery on desktop: the section pins and vertical scroll pans
 * the track, so every product gets a full-height moment. Mobile and reduced-motion use native swipe.
 */
export function BestSellers() {
  const { data, isLoading } = useProducts({ sort: 'popular', limit: 8 })
  const reduce = useReducedMotion()
  const desktop = useMedia('(min-width: 1024px)')
  const pan = desktop && !reduce
  const target = useRef(null)
  const track = useRef(null)
  const distance = useMotionValue(0)
  const start = useMotionValue(0)
  const length = useMotionValue(1)
  const [height, setHeight] = useState(0)
  const items = data?.items || []

  useEffect(() => {
    if (!pan || !track.current) return
    const measure = () => {
      const d = Math.max(0, track.current.scrollWidth - window.innerWidth)
      distance.set(d)
      setHeight(d + window.innerHeight)
      if (target.current) {
        start.set(target.current.getBoundingClientRect().top + window.scrollY)
        length.set(Math.max(1, d))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track.current)
    ro.observe(document.body) // content above can change height as images load
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pan, items.length, distance, start, length, height])

  // Progress through the pinned section, derived from page scroll and the measured section bounds.
  const { scrollY } = useScroll()
  const p = useTransform([scrollY, start, length], ([y, s0, len]) => Math.min(1, Math.max(0, (y - s0) / len)))
  const x = useTransform([p, distance], ([v, d]) => -v * d)
  const progress = useTransform(p, (v) => `${v * 100}%`)

  if (!isLoading && !items.length) return null

  const intro = (
    <div className="flex w-[82vw] shrink-0 flex-col justify-between sm:w-[420px] lg:w-[460px] lg:pr-10">
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-ink">Best sellers</p>
        <h2 className="text-[2.4rem] font-normal leading-[0.95] sm:text-5xl md:text-6xl">
          Most loved <span className="italic">right now.</span>
        </h2>
        <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-muted">Ranked by what customers actually buy, updated with every order.</p>
      </div>
      <Link to="/shop?sort=popular" className="group mt-8 inline-flex items-center gap-3 text-sm font-medium">
        <span className="border-b border-line-strong pb-0.5 group-hover:border-ink">Shop best sellers</span>
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-white transition group-hover:translate-x-1">
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </div>
  )

  const cards = (isLoading ? Array.from({ length: 4 }) : items).map((p, i) => (
    <div key={p?.id ?? i} className="w-[72vw] shrink-0 snap-start sm:w-[340px] lg:w-[360px]">
      {p ? <ProductCard product={p} /> : <ProductCardSkeleton />}
    </div>
  ))

  if (!pan) {
    return (
      <section className="bg-white py-24">
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 sm:px-8">
          {intro}
          {cards}
        </div>
      </section>
    )
  }

  return (
    <section ref={target} className="relative bg-white" style={{ height: height || '200vh' }}>
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-clip">
        <motion.div ref={track} style={{ x }} className="flex items-stretch gap-6 pl-[max(2rem,calc((100vw-1400px)/2+2rem))] pr-16 will-change-transform">
          {intro}
          {cards}
        </motion.div>
        <div className="mx-auto mt-12 h-[2px] w-[min(1400px,90vw)] overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-ink" style={{ width: progress }} />
        </div>
      </div>
    </section>
  )
}

/**
 * Signature product story: the image pins on the left while the reasons to buy scroll past on the right.
 * Uses the first product flagged "Featured" in the admin; every fact shown comes from the product record.
 */
export function Spotlight() {
  const { data } = useProducts({ featured: true, sort: 'featured', limit: 1 })
  const { addToCart } = useCart()
  const reduce = useReducedMotion()
  const p = data?.items?.[0]
  if (!p) return null

  const facts = [
    p.material && { icon: Feather, title: p.material, body: 'Chosen for low weight and all-day comfort on the bridge of your nose.' },
    p.frameShape && { icon: Ruler, title: `${p.frameShape} silhouette`, body: 'A proportion that flatters most face shapes and never dates.' },
    p.category?.slug === 'sunglasses' && { icon: Sun, title: 'UV400 lenses', body: 'Blocks UVA and UVB rays completely, built for bright Indian summers.' },
    { icon: ShieldCheck, title: '1-year warranty', body: 'Covered against manufacturing defects, with 7-day easy returns.' },
  ].filter(Boolean)

  return (
    <section className="relative overflow-x-clip bg-white py-24 md:py-36">
      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            <Link to={`/product/${p.slug}`} className="group block overflow-hidden bg-paper ring-1 ring-line">
              <motion.img
                src={p.images[0]?.url}
                alt={p.name}
                initial={reduce ? false : { scale: 1.12 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: EASE }}
                className="aspect-[4/5] w-full object-cover"
              />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6 lg:pt-10">
          <h2 className="text-[2.6rem] font-normal leading-[0.92] sm:text-6xl md:text-7xl">
            The {p.name.split(' ').slice(0, -1).join(' ')} <span className="italic">{p.name.split(' ').slice(-1)}</span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">{p.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => addToCart(p)}
              disabled={p.stockStatus === 'out_of_stock'}
              className="inline-flex h-13 items-center gap-2 bg-ink px-7 text-sm font-semibold text-white transition hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
            >
              Add to bag, {formatPrice(p.effectivePrice)}
            </button>
            <Link to={`/product/${p.slug}`} className="text-sm font-medium underline-offset-4 hover:underline">
              View details
            </Link>
          </div>

          <div className="mt-14 space-y-4 lg:mt-24 lg:space-y-6">
            {facts.map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: EASE }}
                className="flex gap-5 bg-paper p-6 ring-1 ring-line md:p-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-ink">
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 max-w-[42ch] text-base leading-relaxed text-muted">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
