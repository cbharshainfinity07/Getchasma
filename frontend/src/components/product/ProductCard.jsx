import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Heart, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { ColorDots } from '../ui/Commerce'
import { Skeleton } from '../ui/Feedback'
import { cn, formatPrice } from '../../lib/format'

export function ProductCardSkeleton({ className }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  )
}

/**
 * Product tile: subtle pointer-tracked tilt (motion values, no re-renders), second-image reveal on hover,
 * one-tap add to bag and wishlist. Badges only show real data: discount %, best seller, real low stock.
 */
export default function ProductCard({ product, priority = false, className, size = 'md' }) {
  const { addToCart } = useCart()
  const wishlist = useWishlist()
  const reduce = useReducedMotion()
  const saved = wishlist.has(product.id)
  const [first, second] = product.images
  const soldOut = product.stockStatus === 'out_of_stock'

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.article
      className={cn('group relative flex flex-col', className)}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={cn('relative overflow-hidden bg-paper ring-1 ring-line', size === 'lg' ? 'aspect-[4/5]' : 'aspect-[4/5]')}
      >
        <Link to={`/product/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          {first && (
            <img
              src={first.url}
              alt={first.alt || product.name}
              loading={priority ? 'eager' : 'lazy'}
              className={cn(
                'size-full object-cover transition duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]',
                second && 'group-hover:opacity-0',
                soldOut && 'opacity-50 grayscale',
              )}
            />
          )}
          {second && (
            <img
              src={second.url}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full scale-[1.06] object-cover opacity-0 transition duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-coal/50 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Sold out</span>
          ) : (
            <>
              {product.discountPercent > 0 && (
                <span className="bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink">{product.discountPercent}% off</span>
              )}
              {product.isBestseller && (
                <span className="bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Best seller</span>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => wishlist.toggle(product)}
          className={cn(
            'absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur transition hover:scale-110 hover:bg-white',
            saved && 'text-danger',
          )}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <Heart className={cn('size-4', saved && 'fill-current')} strokeWidth={1.8} />
        </button>

        {!soldOut && (
          <button
            onClick={() => addToCart(product)}
            className="absolute bottom-3 right-3 flex h-11 items-center gap-2 bg-ink px-4 text-sm font-medium text-white shadow-lift transition duration-300 hover:bg-ink-soft active:scale-[0.97] md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="size-4" strokeWidth={2.4} /> <span className="hidden sm:inline">Add to bag</span>
          </button>
        )}
      </motion.div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <Link to={`/product/${product.slug}`} className="block truncate font-display text-lg font-semibold leading-tight text-ink transition group-hover:underline underline-offset-4">
            {product.name}
          </Link>
          <p className="mt-1 truncate text-sm text-muted">
            {[product.frameShape, product.material].filter(Boolean).join(', ') || product.category?.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums text-ink">{formatPrice(product.effectivePrice)}</p>
          {product.salePrice && <p className="text-xs tabular-nums text-subtle line-through">{formatPrice(product.price)}</p>}
        </div>
      </div>
      <div className="mt-3 px-1">
        {product.stockStatus === 'low_stock' ? (
          <p className="text-xs font-medium text-warning">Only {product.stockLeft} left</p>
        ) : (
          <ColorDots colors={product.colors} max={5} />
        )}
      </div>
    </motion.article>
  )
}
