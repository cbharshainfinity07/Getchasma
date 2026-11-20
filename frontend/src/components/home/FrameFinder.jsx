import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useProducts } from '../../lib/queries'
import { cn, formatPrice } from '../../lib/format'
import { Skeleton } from '../ui/Feedback'

/**
 * "Find your frame": shoppers rarely know a product name but know the shape they like.
 * Hover (or tap) a shape on the left and the right side swaps to real products of that shape.
 */
export default function FrameFinder() {
  const reduce = useReducedMotion()
  const { data, isLoading } = useProducts({ limit: 48, sort: 'popular' })
  const groups = useMemo(() => {
    const map = new Map()
    for (const p of data?.items || []) {
      if (!p.frameShape) continue
      if (!map.has(p.frameShape)) map.set(p.frameShape, [])
      map.get(p.frameShape).push(p)
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 7)
  }, [data])
  const [active, setActive] = useState(null)
  const current = groups.find(([s]) => s === active) || groups[0]

  if (!isLoading && groups.length === 0) return null
  const [shape, items] = current || ['', []]
  const [lead, ...rest] = items

  return (
    <section className="relative bg-white py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h2 className="text-[2.4rem] font-normal leading-[0.95] sm:text-5xl md:text-6xl">
              Find your <span className="italic">frame.</span>
            </h2>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted">Start with the shape you love. We will show you every frame cut that way.</p>

            <ul className="mt-10 border-t border-line" role="tablist" aria-label="Frame shapes">
              {(isLoading ? Array.from({ length: 5 }) : groups).map((g, i) => {
                if (!g) return <li key={i} className="border-b border-line py-4"><Skeleton className="h-9 w-1/2" /></li>
                const [s, list] = g
                const on = s === shape
                return (
                  <li key={s} className="border-b border-line">
                    <button
                      role="tab"
                      aria-selected={on}
                      onMouseEnter={() => setActive(s)}
                      onFocus={() => setActive(s)}
                      onClick={() => setActive(s)}
                      className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span
                        className={cn(
                          'font-display text-3xl font-semibold tracking-tight transition-all duration-300 md:text-4xl',
                          on ? 'translate-x-2 text-ink' : 'text-subtle group-hover:text-ink',
                        )}
                      >
                        {s}
                      </span>
                      <span className={cn('text-sm tabular-nums transition', on ? 'text-ink' : 'text-subtle')}>
                        {list.length} {list.length === 1 ? 'style' : 'styles'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="relative lg:col-span-7 lg:pt-4">
            <AnimatePresence mode="wait">
              {lead ? (
                <motion.div
                  key={shape}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-6 gap-3 md:h-[600px] md:grid-rows-2 md:gap-4"
                >
                  <Link to={`/product/${lead.slug}`} className="group relative col-span-6 overflow-hidden bg-paper md:col-span-4 md:row-span-2">
                    <img src={lead.images[0]?.url} alt={lead.name} className="aspect-[4/3] w-full object-cover transition duration-[1200ms] group-hover:scale-105 md:absolute md:inset-0 md:aspect-auto md:h-full" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-coal/85 via-coal/30 to-transparent p-5 text-snow md:p-7">
                      <div>
                        <p className="font-display text-2xl font-semibold md:text-3xl">{lead.name}</p>
                        <p className="mt-1 text-sm text-snow/70">{formatPrice(lead.effectivePrice)}</p>
                      </div>
                      <span className="flex size-11 items-center justify-center rounded-full bg-ink text-white transition duration-300 group-hover:rotate-45">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </div>
                  </Link>
                  {rest.slice(0, 2).map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="group col-span-3 flex flex-col overflow-hidden bg-paper ring-1 ring-line md:col-span-2">
                      <img src={p.images[0]?.url} alt={p.name} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105 md:aspect-auto md:min-h-0 md:flex-1" />
                      <div className="p-4">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-sm text-muted">{formatPrice(p.effectivePrice)}</p>
                      </div>
                    </Link>
                  ))}
                  {rest.length === 0 && (
                    <Link
                      to={`/shop?shapes=${encodeURIComponent(shape)}`}
                      className="col-span-6 flex flex-col justify-between bg-paper p-6 text-ink md:col-span-2 md:row-span-2"
                    >
                      <p className="font-display text-2xl font-semibold leading-tight">More {shape.toLowerCase()} frames arrive every season.</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Browse the shop <ArrowUpRight className="size-4" /></span>
                    </Link>
                  )}
                </motion.div>
              ) : (
                <Skeleton className="h-[460px] md:h-[600px]" />
              )}
            </AnimatePresence>
            {lead && (
              <Link
                to={`/shop?shapes=${encodeURIComponent(shape)}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline"
              >
                Shop all {shape.toLowerCase()} frames <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
