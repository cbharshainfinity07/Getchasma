import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { Input } from '../ui/Field'
import Button from '../ui/Button'
import { Skeleton } from '../ui/Feedback'
import { formatPrice, cn } from '../../lib/format'

export function DiscountForm({ applied, onApply, onRemove, error, loading }) {
  const [code, setCode] = useState('')
  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-success-soft px-3.5 py-2.5 text-sm text-success">
        <span className="flex items-center gap-2 font-medium">
          <Tag className="size-3.5" /> {applied}
        </span>
        <button onClick={onRemove} className="rounded-full p-1 hover:bg-success/10" aria-label="Remove discount code">
          <X className="size-3.5" />
        </button>
      </div>
    )
  }
  // Not a <form>: this control sits inside the checkout form, and nested forms are invalid HTML
  // (the browser would make "Apply" submit the whole order).
  const apply = () => {
    if (code.trim()) onApply(code.trim().toUpperCase())
  }
  return (
    <div role="group" aria-label="Discount code">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
          placeholder="Discount code"
          aria-label="Discount code"
          error={error}
          className="uppercase placeholder:normal-case"
        />
        <Button type="button" variant="secondary" loading={loading} disabled={!code.trim()} onClick={apply}>
          Apply
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger" role="alert">{error}</p>}
    </div>
  )
}

export function Totals({ quote, loading, className }) {
  if (!quote && loading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }
  if (!quote) return null
  const rows = [
    ['Subtotal', formatPrice(quote.subtotal)],
    quote.discountTotal > 0 && [`Discount${quote.discountCode ? ` (${quote.discountCode})` : ''}`, `−${formatPrice(quote.discountTotal, { exact: true })}`, 'text-success'],
    ['Shipping', quote.shippingTotal === 0 ? 'Free' : formatPrice(quote.shippingTotal)],
    !quote.tax.inclusive && [`${quote.tax.label} (${quote.tax.rate}%)`, formatPrice(quote.taxTotal, { exact: true })],
  ].filter(Boolean)
  return (
    <dl className={cn('space-y-2.5 text-sm', loading && 'opacity-60', className)}>
      {rows.map(([k, v, c]) => (
        <div key={k} className="flex justify-between">
          <dt className="text-muted">{k}</dt>
          <dd className={cn('font-medium', c)}>{v}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <dt className="font-semibold">Total</dt>
        <dd className="text-2xl font-semibold tracking-tight">{formatPrice(quote.total, { exact: !Number.isInteger(quote.total) })}</dd>
      </div>
      {quote.tax.inclusive && quote.taxTotal > 0 && (
        <p className="text-right text-xs text-subtle">
          Includes {formatPrice(quote.taxTotal, { exact: true })} {quote.tax.label}
        </p>
      )}
    </dl>
  )
}
