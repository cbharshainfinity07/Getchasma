import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, ArrowUpRight } from 'lucide-react'
import { useProducts } from '../../lib/queries'
import { formatPrice } from '../../lib/format'
import { Spinner } from '../ui/Feedback'

const SUGGESTIONS = ['Aviator', 'Cat-Eye', 'Round', 'Titanium', 'Blue light', 'Polarised']

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function SearchOverlay({ open, onClose }) {
  const [term, setTerm] = useState('')
  const q = useDebounced(term.trim())
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { data, isFetching } = useProducts({ q, limit: 6 }, { enabled: open && q.length >= 2 })

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const submit = (e) => {
    e.preventDefault()
    if (!term.trim()) return
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`)
    onClose()
  }

  const results = q.length >= 2 ? data?.items || [] : []

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white shadow-pop"
          >
            <div className="mx-auto max-w-3xl px-5 pb-8 pt-6 sm:pt-10">
              <form onSubmit={submit} className="flex items-center gap-3 border-b-2 border-ink pb-3">
                <Search className="size-6 shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search frames, shapes, materials…"
                  className="w-full bg-transparent font-display text-2xl tracking-tight placeholder:text-subtle focus:outline-none sm:text-3xl"
                  aria-label="Search products"
                />
                {isFetching && <Spinner />}
                <button type="button" onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-paper" aria-label="Close search">
                  <X className="size-5" />
                </button>
              </form>

              {q.length < 2 ? (
                <div className="mt-6">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => setTerm(s)} className="rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-ink">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length ? (
                <div className="mt-6">
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link to={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-paper">
                          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                            <img src={p.images[0]?.url} alt="" className="size-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="text-xs text-muted">{p.category?.name} · {formatPrice(p.effectivePrice)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button onClick={submit} className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                    See all results for “{term.trim()}” <ArrowUpRight className="size-4" />
                  </button>
                </div>
              ) : (
                !isFetching && <p className="mt-6 text-sm text-muted">No frames match “{q}”. Try a shape like “round” or a material like “titanium”.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
