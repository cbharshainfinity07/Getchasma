import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/format'

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink-soft active:opacity-90 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]',
  secondary: 'bg-white text-ink border border-line-strong hover:border-ink hover:bg-paper/60',
  ghost: 'text-ink hover:bg-paper',
  light: 'bg-white text-ink hover:bg-paper',
  outlineLight: 'border border-white/40 text-white hover:bg-white hover:text-ink',
  lime: 'bg-ink text-white hover:bg-ink-soft active:opacity-90', // alias of primary, kept for compatibility
  danger: 'bg-danger text-white hover:bg-danger/90',
  dangerGhost: 'text-danger hover:bg-danger-soft',
  accent: 'bg-accent text-white hover:opacity-90',
}

const SIZES = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-[2px]',
  sm: 'h-9 px-4 text-[13px] gap-2 rounded-[2px]',
  md: 'h-11 px-5 text-sm gap-2 rounded-[2px]',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-[2px]',
  icon: 'h-10 w-10 rounded-full justify-center',
  iconSm: 'h-8 w-8 rounded-full justify-center',
}

/**
 * Single button primitive used across storefront and admin.
 * Renders a <Link> when `to` is set, an <a> for `href`, otherwise a <button>.
 */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, to, href, full, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap select-none',
    'transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out',
    'active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    full && 'w-full',
    className,
  )
  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </>
  )
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} type={props.type || 'button'} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...props}>
      {content}
    </button>
  )
})

export default Button
