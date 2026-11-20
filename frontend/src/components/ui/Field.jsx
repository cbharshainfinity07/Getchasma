import { forwardRef, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/format'

const control =
  'w-full rounded-xl border bg-white text-[15px] sm:text-sm text-ink placeholder:text-subtle transition-colors duration-150 ' +
  'focus:outline-none focus:ring-4 focus:ring-ink/5 disabled:bg-paper disabled:text-muted'
const tone = (error) => (error ? 'border-danger focus:border-danger' : 'border-line-strong hover:border-subtle focus:border-ink')

export function Label({ children, htmlFor, required, hint, className }) {
  return (
    <label htmlFor={htmlFor} className={cn('flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink mb-1.5', className)}>
      <span>
        {children}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {hint && <span className="text-xs font-normal text-subtle">{hint}</span>}
    </label>
  )
}

export function FieldMessage({ error, help }) {
  if (error) return <p className="mt-1.5 text-xs text-danger" role="alert">{error}</p>
  if (help) return <p className="mt-1.5 text-xs text-muted">{help}</p>
  return null
}

/** Label + control + error/help, wired with ids for accessibility. */
export function Field({ label, required, hint, error, help, children, className }) {
  const id = useId()
  return (
    <div className={className}>
      {label && <Label htmlFor={id} required={required} hint={hint}>{label}</Label>}
      {children({ id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': error ? `${id}-err` : undefined })}
      <div id={`${id}-err`}>
        <FieldMessage error={error} help={help} />
      </div>
    </div>
  )
}

export const Input = forwardRef(function Input({ error, className, prefix, suffix, ...props }, ref) {
  if (prefix || suffix) {
    return (
      <div className={cn('flex items-center rounded-xl border bg-white focus-within:ring-4 focus-within:ring-ink/5', tone(error), 'focus-within:border-ink', className)}>
        {prefix && <span className="pl-3.5 text-sm text-muted">{prefix}</span>}
        <input ref={ref} className="h-11 w-full bg-transparent px-3.5 text-[15px] sm:text-sm focus:outline-none placeholder:text-subtle" {...props} />
        {suffix && <span className="pr-3.5 text-sm text-muted">{suffix}</span>}
      </div>
    )
  }
  return <input ref={ref} className={cn(control, tone(error), 'h-11 px-3.5', className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ error, className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(control, tone(error), 'px-3.5 py-3 leading-relaxed resize-y', className)} {...props} />
})

export const Select = forwardRef(function Select({ error, className, children, ...props }, ref) {
  return (
    <div className={cn('relative', className)}>
      <select ref={ref} className={cn(control, tone(error), 'h-11 appearance-none pl-3.5 pr-10')} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  )
})

export function Checkbox({ checked, onChange, label, description, className, disabled }) {
  return (
    <label className={cn('flex items-start gap-3 select-none', disabled ? 'opacity-50' : 'cursor-pointer', className)}>
      <span className="relative mt-0.5 inline-flex">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className="flex size-[18px] items-center justify-center rounded-[5px] border border-line-strong bg-white transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-4 peer-focus-visible:ring-ink/10">
          <Check className={cn('size-3 text-white transition-opacity', checked ? 'opacity-100' : 'opacity-0')} strokeWidth={3} />
        </span>
      </span>
      {(label || description) && (
        <span className="text-sm leading-tight">
          {label && <span className="font-medium text-ink">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
        </span>
      )}
    </label>
  )
}

export function Switch({ checked, onChange, label, description, disabled, className }) {
  return (
    <label className={cn('flex items-center justify-between gap-4 select-none', disabled ? 'opacity-50' : 'cursor-pointer', className)}>
      {(label || description) && (
        <span className="text-sm">
          {label && <span className="font-medium text-ink">{label}</span>}
          {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-ink' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-snow shadow-sm transition-transform duration-200 ease-out',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  )
}
