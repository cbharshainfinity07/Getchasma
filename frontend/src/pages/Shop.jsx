import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, SearchX, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useCategories, useFacets, useProducts } from '../lib/queries'
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard'
import { Checkbox, Select, Input } from '../components/ui/Field'
import { Drawer } from '../components/ui/Overlay'
import { EmptyState, ErrorState } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import { cn, formatPrice } from '../lib/format'

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
]
const GENDERS = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
]
const PRICE_PRESETS = [
  { label: 'Under ₹2,500', max: 2500 },
  { label: '₹2,500 to ₹4,000', min: 2500, max: 4000 },
  { label: 'Above ₹4,000', min: 4000 },
]

const csv = (v) => (v ? v.split(',').filter(Boolean) : [])

function FilterGroup({ title, children, count }) {
  return (
    <details open className="group border-b border-line py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        <span>
          {title} {count > 0 && <span className="ml-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
        </span>
        <span className="text-lg leading-none text-muted transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

function Filters({ params, set, toggleList, categories, facets, activeCategory, navigate }) {
  const [min, setMin] = useState(params.get('minPrice') || '')
  const [max, setMax] = useState(params.get('maxPrice') || '')
  useEffect(() => {
    setMin(params.get('minPrice') || '')
    setMax(params.get('maxPrice') || '')
  }, [params])

  const colors = csv(params.get('colors'))
  const materials = csv(params.get('materials'))
  const genders = csv(params.get('genders'))
  const shapes = csv(params.get('shapes'))

  return (
    <div>
      <FilterGroup title="Category">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate({ pathname: '/shop', search: params.toString() })}
              className={cn('flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-paper', !activeCategory && 'font-semibold')}
            >
              All eyewear {!activeCategory && <Check className="size-3.5" />}
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate({ pathname: `/shop/${c.slug}`, search: params.toString() })}
                className={cn('flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-paper', activeCategory === c.slug && 'font-semibold')}
              >
                <span>{c.name}</span>
                <span className="text-xs text-subtle">{c.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price" count={params.get('minPrice') || params.get('maxPrice') ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => {
            const active = String(p.min ?? '') === (params.get('minPrice') || '') && String(p.max ?? '') === (params.get('maxPrice') || '')
            return (
              <button
                key={p.label}
                onClick={() => set({ minPrice: active ? null : p.min ?? null, maxPrice: active ? null : p.max ?? null })}
                className={cn('rounded-full border px-3 py-1.5 text-xs transition', active ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink')}
              >
                {p.label}
              </button>
            )
          })}
        </div>
        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            set({ minPrice: min || null, maxPrice: max || null })
          }}
        >
          <Input type="number" min="0" inputMode="numeric" placeholder={`₹${facets?.price?.min ?? 0}`} value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" className="h-9" />
          <span className="text-muted">to</span>
          <Input type="number" min="0" inputMode="numeric" placeholder={`₹${facets?.price?.max ?? ''}`} value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" className="h-9" />
          <Button type="submit" size="sm" variant="secondary">Go</Button>
        </form>
      </FilterGroup>

      {facets?.shapes?.length > 0 && (
        <FilterGroup title="Frame shape" count={shapes.length}>
          <div className="flex flex-wrap gap-2">
            {facets.shapes.map((sh) => {
              const active = shapes.some((x) => x.toLowerCase() === sh.value.toLowerCase())
              return (
                <button
                  key={sh.value}
                  onClick={() => toggleList('shapes', sh.value)}
                  aria-pressed={active}
                  className={cn('rounded-full border px-3 py-1.5 text-xs transition', active ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-ink')}
                >
                  {sh.value}
                </button>
              )
            })}
          </div>
        </FilterGroup>
      )}

      {facets?.colors?.length > 0 && (
        <FilterGroup title="Colour" count={colors.length}>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => {
              const active = colors.some((x) => x.toLowerCase() === c.name.toLowerCase())
              return (
                <button
                  key={c.name}
                  onClick={() => toggleList('colors', c.name)}
                  aria-pressed={active}
                  className={cn('flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs transition', active ? 'border-ink bg-paper' : 'border-line hover:border-subtle')}
                >
                  <span className="size-5 rounded-full ring-1 ring-inset ring-black/15" style={{ background: c.hex }} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </FilterGroup>
      )}

      {facets?.materials?.length > 0 && (
        <FilterGroup title="Frame material" count={materials.length}>
          <div className="space-y-3">
            {facets.materials.map((m) => (
              <Checkbox
                key={m.value}
                checked={materials.some((x) => x.toLowerCase() === m.value.toLowerCase())}
                onChange={() => toggleList('materials', m.value)}
                label={
                  <span className="flex items-center gap-2 font-normal">
                    {m.value} <span className="text-xs text-subtle">({m.count})</span>
                  </span>
                }
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Gender" count={genders.length}>
        <div className="space-y-3">
          {GENDERS.map((g) => (
            <Checkbox key={g.value} checked={genders.includes(g.value)} onChange={() => toggleList('genders', g.value)} label={<span className="font-normal">{g.label}</span>} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-3">
          <Checkbox checked={params.get('inStock') === 'true'} onChange={(v) => set({ inStock: v ? 'true' : null })} label={<span className="font-normal">In stock only</span>} />
          <Checkbox checked={params.get('onSale') === 'true'} onChange={(v) => set({ onSale: v ? 'true' : null })} label={<span className="font-normal">On sale</span>} />
          <Checkbox checked={params.get('bestseller') === 'true'} onChange={(v) => set({ bestseller: v ? 'true' : null })} label={<span className="font-normal">Best sellers</span>} />
        </div>
      </FilterGroup>
    </div>
  )
}

export default function Shop() {
  const { category: activeCategory } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState(false)
  const { data: categories = [] } = useCategories()
  const { data: facets } = useFacets()

  const page = Number(params.get('page')) || 1
  const query = useMemo(
    () => ({
      category: activeCategory,
      q: params.get('q'),
      sort: params.get('sort') || 'featured',
      colors: params.get('colors'),
      materials: params.get('materials'),
      genders: params.get('genders'),
      shapes: params.get('shapes'),
      minPrice: params.get('minPrice'),
      maxPrice: params.get('maxPrice'),
      inStock: params.get('inStock'),
      onSale: params.get('onSale'),
      bestseller: params.get('bestseller'),
      page,
      limit: 12,
    }),
    [params, activeCategory, page],
  )
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts(query)

  const set = (patch) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === undefined || v === '') next.delete(k)
      else next.set(k, String(v))
    }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: false })
  }
  const toggleList = (key, value) => {
    const list = csv(params.get(key))
    const has = list.some((x) => x.toLowerCase() === value.toLowerCase())
    const next = has ? list.filter((x) => x.toLowerCase() !== value.toLowerCase()) : [...list, value]
    set({ [key]: next.join(',') || null })
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const cat = categories.find((c) => c.slug === activeCategory)
  const q = params.get('q')
  const shapeList = csv(params.get('shapes'))
  const title = q ? `Results for “${q}”` : cat ? cat.name : shapeList.length === 1 ? `${shapeList[0]} frames` : params.get('onSale') ? 'On sale' : params.get('bestseller') ? 'Best sellers' : 'All eyewear'

  // Active filter chips
  const chips = []
  if (q) chips.push({ label: `“${q}”`, clear: () => set({ q: null }) })
  csv(params.get('colors')).forEach((c) => chips.push({ label: c, clear: () => toggleList('colors', c) }))
  csv(params.get('materials')).forEach((m) => chips.push({ label: m, clear: () => toggleList('materials', m) }))
  csv(params.get('shapes')).forEach((sh) => chips.push({ label: sh, clear: () => toggleList('shapes', sh) }))
  csv(params.get('genders')).forEach((g) => chips.push({ label: g[0].toUpperCase() + g.slice(1), clear: () => toggleList('genders', g) }))
  if (params.get('minPrice') || params.get('maxPrice')) {
    chips.push({
      label: `${params.get('minPrice') ? formatPrice(params.get('minPrice')) : '₹0'} to ${params.get('maxPrice') ? formatPrice(params.get('maxPrice')) : 'any'}`,
      clear: () => set({ minPrice: null, maxPrice: null }),
    })
  }
  if (params.get('inStock')) chips.push({ label: 'In stock', clear: () => set({ inStock: null }) })
  if (params.get('onSale')) chips.push({ label: 'On sale', clear: () => set({ onSale: null }) })
  if (params.get('bestseller')) chips.push({ label: 'Best sellers', clear: () => set({ bestseller: null }) })

  const filterProps = { params, set, toggleList, categories, facets, activeCategory, navigate }
  const items = data?.items || []
  const total = data?.total ?? 0
  const from = total ? (page - 1) * 12 + 1 : 0
  const to = Math.min(total, page * 12)

  return (
    <div className="bg-white pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link> <span className="mx-1.5">/</span>
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          {cat && (
            <>
              <span className="mx-1.5">/</span>
              <span className="text-ink">{cat.name}</span>
            </>
          )}
        </nav>
        <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl font-normal leading-[0.95] tracking-[-0.04em] md:text-7xl">{title}</h1>
            {cat?.description && !q && <p className="mt-3 max-w-xl text-[15px] text-muted">{cat.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
              <SlidersHorizontal className="size-3.5" /> Filters {chips.length > 0 && `(${chips.length})`}
            </Button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <Select id="sort" value={params.get('sort') || 'featured'} onChange={(e) => set({ sort: e.target.value })} className="w-48">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 -mt-5 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-hide">
              <Filters {...filterProps} />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex min-h-8 flex-wrap items-center gap-2">
              <p className="mr-2 text-sm text-muted" aria-live="polite">
                {isLoading ? 'Loading…' : total ? `Showing ${from}-${to} of ${total} ${total === 1 ? 'frame' : 'frames'}` : ''}
              </p>
              {chips.map((c) => (
                <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-medium ring-1 ring-line transition hover:ring-ink">
                  {c.label} <X className="size-3" />
                </button>
              ))}
              {chips.length > 1 && (
                <button onClick={() => navigate(activeCategory ? `/shop/${activeCategory}` : '/shop')} className="text-xs font-medium underline underline-offset-4">
                  Clear all
                </button>
              )}
            </div>

            {isError ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : !isLoading && items.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No frames match these filters"
                description="Try removing a filter or searching for a different shape, colour or material."
                action={<Button variant="secondary" size="sm" to="/shop">Clear filters</Button>}
              />
            ) : (
              <div className={cn('grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
                {(isLoading ? Array.from({ length: 6 }) : items).map((p, i) =>
                  p ? <ProductCard key={p.id} product={p} priority={i < 3} /> : <ProductCardSkeleton key={i} />,
                )}
              </div>
            )}

            {data?.pages > 1 && (
              <nav className="mt-14 flex items-center justify-center gap-1" aria-label="Pagination">
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => set({ page: page - 1 })} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => set({ page: n })}
                    aria-current={n === page ? 'page' : undefined}
                    className={cn('size-10 rounded-full text-sm font-medium transition', n === page ? 'bg-ink text-white' : 'hover:bg-paper')}
                  >
                    {n}
                  </button>
                ))}
                <Button variant="ghost" size="icon" disabled={page >= data.pages} onClick={() => set({ page: page + 1 })} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </Button>
              </nav>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        side="left"
        title="Filters"
        footer={<Button full onClick={() => setDrawer(false)}>Show {total} results</Button>}
      >
        <div className="px-6">
          <Filters {...filterProps} />
        </div>
      </Drawer>
    </div>
  )
}
