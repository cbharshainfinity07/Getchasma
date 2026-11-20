const inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })

/** ₹5,499 (whole rupees) or ₹1,193.99 when there are paise. */
export function formatPrice(value, { exact = false } = {}) {
  const n = Number(value) || 0
  if (exact || !Number.isInteger(Math.round(n * 100) / 100)) return inr2.format(n)
  return inr0.format(n)
}

export const formatCompactPrice = (n) => `₹${compact.format(Number(n) || 0)}`
export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0)

export function formatDate(iso, opts = {}) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return formatDate(iso)
}

export const cn = (...classes) => classes.flat().filter(Boolean).join(' ')

export const ORDER_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'danger' },
}

export const PAYMENT_STATUS = {
  pending: { label: 'Unpaid', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  partially_refunded: { label: 'Part refunded', tone: 'neutral' },
}

export const PAYMENT_METHOD = { cod: 'Cash on delivery', razorpay: 'Online (Razorpay)' }

/** Resolve stored image paths. Absolute URLs pass through; /uploads and /public paths are same-origin. */
export const imageSrc = (url) => url || '/logo.webp'
