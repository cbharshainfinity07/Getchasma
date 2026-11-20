import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/format'
import Button from './Button'

const TONES = {
  neutral: 'bg-paper text-muted ring-line',
  success: 'bg-success-soft text-success ring-success/15',
  warning: 'bg-warning-soft text-warning ring-warning/15',
  danger: 'bg-danger-soft text-danger ring-danger/15',
  info: 'bg-info-soft text-info ring-info/15',
  accent: 'bg-accent-soft text-accent-ink ring-accent/30',
  dark: 'bg-ink text-white ring-ink',
}

export function Badge({ tone = 'neutral', dot, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-lg', className)} aria-hidden />
}

export function Spinner({ className, label = 'Loading' }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-muted', className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'py-10' : 'py-20', className)}>
      {Icon && (
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-paper ring-1 ring-line">
          <Icon className="size-6 text-muted" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <EmptyState
      className={className}
      icon={AlertTriangle}
      title="Something went wrong"
      description={error?.message || 'We could not load this content.'}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="size-3.5" /> Try again
          </Button>
        )
      }
    />
  )
}

export function Alert({ tone = 'warning', title, children, className, icon: Icon = AlertTriangle }) {
  return (
    <div className={cn('flex gap-3 rounded-xl p-3.5 text-sm ring-1 ring-inset', TONES[tone], className)} role="alert">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
    </div>
  )
}
