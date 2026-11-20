import { Minus, Plus, Star } from 'lucide-react'
import { cn, formatPrice } from '../../lib/format'

export function Price({ price, salePrice, size = 'md', className, showPercent = false }) {
  const onSale = salePrice != null && salePrice < price
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl md:text-3xl' }
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-semibold tracking-tight text-ink', sizes[size])}>{formatPrice(onSale ? salePrice : price)}</span>
      {onSale && (
        <>
          <span className={cn('text-subtle line-through', size === 'lg' ? 'text-base' : 'text-xs')}>{formatPrice(price)}</span>
          {showPercent && (
            <span className={cn('font-semibold text-success', size === 'lg' ? 'text-sm' : 'text-xs')}>
              {Math.round(((price - salePrice) / price) * 100)}% off
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = 'md', label = 'Quantity' }) {
  const h = size === 'sm' ? 'h-8' : 'h-11'
  const w = size === 'sm' ? 'w-8' : 'w-11'
  return (
    <div className={cn('inline-flex items-center rounded-full border border-line-strong bg-white', h)} role="group" aria-label={label}>
      <button
        type="button"
        className={cn('flex h-full items-center justify-center rounded-l-full text-ink transition hover:bg-paper disabled:opacity-30', w)}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <span className={cn('min-w-8 text-center font-medium tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm')} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn('flex h-full items-center justify-center rounded-r-full text-ink transition hover:bg-paper disabled:opacity-30', w)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

export function ColorDots({ colors = [], max = 4, size = 'sm', selected, onSelect }) {
  const s = size === 'sm' ? 'size-3.5' : 'size-8'
  const shown = colors.slice(0, max)
  return (
    <div className="flex items-center gap-1.5">
      {shown.map((c) =>
        onSelect ? (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelect(c.name)}
            aria-label={c.name}
            aria-pressed={selected === c.name}
            title={c.name}
            className={cn(
              'rounded-full p-0.5 ring-1 transition',
              selected === c.name ? 'ring-ink ring-2' : 'ring-line hover:ring-subtle',
            )}
          >
            <span className={cn('block rounded-full ring-1 ring-inset ring-black/10', s)} style={{ background: c.hex }} />
          </button>
        ) : (
          <span key={c.name} title={c.name} className={cn('rounded-full ring-1 ring-inset ring-black/15', s)} style={{ background: c.hex }} />
        ),
      )}
      {colors.length > max && <span className="text-[11px] text-muted">+{colors.length - max}</span>}
    </div>
  )
}

export function Stars({ rating = 5, className }) {
  return (
    <div className={cn('flex gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={cn('size-3.5', i < rating ? 'fill-accent text-accent' : 'text-line-strong')} />
      ))}
    </div>
  )
}

export function StockIndicator({ status, left, className }) {
  const map = {
    in_stock: { dot: 'bg-success', text: 'In stock', color: 'text-success' },
    low_stock: { dot: 'bg-warning', text: left ? `Only ${left} left` : 'Low stock', color: 'text-warning' },
    out_of_stock: { dot: 'bg-subtle', text: 'Out of stock', color: 'text-muted' },
  }
  const m = map[status] || map.in_stock
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', m.color, className)}>
      <span className={cn('relative flex size-2')}>
        {status === 'low_stock' && <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', m.dot)} />}
        <span className={cn('relative inline-flex size-2 rounded-full', m.dot)} />
      </span>
      {m.text}
    </span>
  )
}
