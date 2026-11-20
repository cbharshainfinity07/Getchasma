import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, UploadCloud, X, GripVertical, ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Badge, Skeleton } from '../components/ui/Feedback'
import { cn, ORDER_STATUS, PAYMENT_STATUS } from '../lib/format'

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink">
            <ChevronLeft className="size-3.5" /> {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}>
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, description, actions, children, className, bodyClassName, padded = true }) {
  return (
    <section className={cn('rounded-2xl border border-line bg-white', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em' }}>{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(padded && 'p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, icon: Icon, change, hint, to, loading, tone }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn('flex size-8 items-center justify-center rounded-lg', tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-paper text-ink')}>
            <Icon className="size-4" strokeWidth={1.8} />
          </span>
        )}
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-[26px] font-semibold tracking-tight tabular-nums">{value}</p>}
      <div className="mt-1 flex items-center gap-2 text-xs">
        {change != null && Number.isFinite(change) && (
          <span className={cn('inline-flex items-center font-medium', change >= 0 ? 'text-success' : 'text-danger')}>
            {change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </>
  )
  const cls = 'block rounded-2xl border border-line bg-white p-5 transition'
  return to ? (
    <Link to={to} className={cn(cls, 'hover:border-line-strong hover:shadow-card')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

export const pctChange = (curr, prev) => (prev ? Math.round(((curr - prev) / prev) * 100) : curr ? null : null)

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  const [v, setV] = useState(value || '')
  const first = useRef(true)
  useEffect(() => setV(value || ''), [value])
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => onChange(v), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-line-strong bg-white pl-9 pr-3 text-sm placeholder:text-subtle focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5"
      />
    </div>
  )
}

export function FilterTabs({ value, onChange, options }) {
  return (
    <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition',
            value === o.value ? 'bg-ink text-white' : 'text-muted hover:bg-white hover:text-ink',
          )}
        >
          {o.label}
          {o.count != null && <span className={cn('text-[11px] tabular-nums', value === o.value ? 'text-white/60' : 'text-subtle')}>{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Table({ children, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  )
}
export const Th = ({ children, className }) => (
  <th className={cn('whitespace-nowrap border-b border-line bg-paper/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted first:pl-5 last:pr-5', className)}>
    {children}
  </th>
)
export const Td = ({ children, className, ...props }) => (
  <td className={cn('border-b border-line px-4 py-3 align-middle first:pl-5 last:pr-5', className)} {...props}>
    {children}
  </td>
)

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} className={cn('h-5', j === 0 ? 'w-1/3' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Pagination({ page, pages, total, onChange, label = 'results' }) {
  if (!total) return null
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
      <p className="text-muted">
        {total} {label}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded-lg p-1.5 transition hover:bg-paper disabled:opacity-30" aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-2 tabular-nums text-muted">
            {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded-lg p-1.5 transition hover:bg-paper disabled:opacity-30" aria-label="Next page">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export const OrderStatusBadge = ({ status }) => {
  const s = ORDER_STATUS[status] || { label: status, tone: 'neutral' }
  return <Badge tone={s.tone} dot>{s.label}</Badge>
}
export const PaymentBadge = ({ status }) => {
  const s = PAYMENT_STATUS[status] || { label: status, tone: 'neutral' }
  return <Badge tone={s.tone}>{s.label}</Badge>
}
export const ProductStatusBadge = ({ status }) => {
  const map = { published: ['Published', 'success'], draft: ['Draft', 'neutral'], archived: ['Archived', 'warning'] }
  const [label, tone] = map[status] || [status, 'neutral']
  return <Badge tone={tone} dot>{label}</Badge>
}
export function StockBadge({ stock, threshold }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>
  if (stock <= threshold) return <Badge tone="warning">Low · {stock}</Badge>
  return <span className="tabular-nums">{stock}</span>
}

export function Thumb({ src, className }) {
  return (
    <div className={cn('size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-paper', className)}>
      {src ? <img src={src} alt="" className="size-full object-cover" loading="lazy" /> : <ImagePlus className="m-auto mt-2.5 size-4 text-subtle" />}
    </div>
  )
}

/**
 * Multi-image uploader with previews, drag-to-reorder, alt text and removal.
 * Files are uploaded immediately to /api/admin/uploads (validated server-side); the parent receives URLs.
 */
export function ImageUploader({ value = [], onChange, max = 10, single = false, error }) {
  const [uploading, setUploading] = useState(0)
  const [dragIndex, setDragIndex] = useState(null)
  const [over, setOver] = useState(false)
  const inputRef = useRef(null)

  const upload = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    const room = single ? 1 : max - value.length
    if (room <= 0) return toast.error(`You can add up to ${max} images`)
    const batch = files.slice(0, room)
    for (const f of batch) {
      if (f.size > 5 * 1024 * 1024) return toast.error(`${f.name} is larger than 5 MB`)
    }
    setUploading(batch.length)
    try {
      const { files: uploaded } = await api.upload('/admin/uploads', batch)
      const next = uploaded.map((u) => ({ url: u.url, alt: '' }))
      onChange(single ? next.slice(0, 1) : [...value, ...next])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const move = (from, to) => {
    if (from === to || from == null) return
    const next = [...value]
    const [m] = next.splice(from, 1)
    next.splice(to, 0, m)
    onChange(next)
  }

  return (
    <div>
      <div className={cn('grid gap-3', single ? 'grid-cols-1' : 'grid-cols-3 sm:grid-cols-4')}>
        {value.map((img, i) => (
          <div
            key={img.url}
            draggable={!single}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              move(dragIndex, i)
              setDragIndex(null)
            }}
            className={cn('group relative overflow-hidden rounded-xl border border-line bg-paper', single ? 'aspect-[16/10]' : 'aspect-square', dragIndex === i && 'opacity-40')}
          >
            <img src={img.url} alt={img.alt || ''} className="size-full object-cover" />
            {i === 0 && !single && <span className="absolute left-2 top-2 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
            <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              {!single && (
                <span className="cursor-grab rounded-md bg-white/90 p-1 text-muted" title="Drag to reorder">
                  <GripVertical className="size-3.5" />
                </span>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-md bg-white/90 p-1 text-danger hover:bg-white" aria-label="Remove image">
                <X className="size-3.5" />
              </button>
            </div>
            {!single && i > 0 && (
              <button type="button" onClick={() => move(i, 0)} className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium opacity-0 transition group-hover:opacity-100">
                Make cover
              </button>
            )}
          </div>
        ))}
        {(single ? value.length === 0 : value.length < max) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setOver(false)
              if (e.dataTransfer.files?.length) upload(e.dataTransfer.files)
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center transition',
              single ? 'aspect-[16/10]' : 'aspect-square',
              over ? 'border-ink bg-paper' : error ? 'border-danger/50' : 'border-line-strong hover:border-subtle hover:bg-paper/50',
            )}
          >
            {uploading ? <Loader2 className="size-5 animate-spin text-muted" /> : <UploadCloud className="size-5 text-muted" />}
            <span className="px-2 text-xs font-medium">{uploading ? `Uploading ${uploading}…` : 'Add images'}</span>
            <span className="px-2 text-[10px] text-subtle">JPG, PNG, WebP · 5 MB</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={!single} className="hidden" onChange={(e) => upload(e.target.files)} />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  )
}
