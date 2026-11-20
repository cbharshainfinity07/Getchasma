import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/format'

/**
 * Section heading: display headline with an optional lime-highlighted phrase (same family, no serif swap),
 * optional one-line description stacked below, and an optional link aligned to the baseline.
 * Eyebrows are opt-in and used sparingly across the page.
 */
export default function SectionHeader({ eyebrow, title, accent, description, link, linkLabel = 'View all', className, children }) {
  const reduce = useReducedMotion()
  return (
    <div className={cn('mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between', className)}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl"
      >
        {eyebrow && <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-ink">{eyebrow}</p>}
        <h2 className="text-[2.4rem] font-normal leading-[0.95] text-ink sm:text-5xl md:text-6xl">
          {title} {accent && <span className="italic">{accent}</span>}
        </h2>
        {description && <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted">{description}</p>}
      </motion.div>
      {children}
      {link && (
        <Link
          to={link}
          className="group inline-flex shrink-0 items-center gap-3 self-start text-sm font-medium text-ink md:self-end"
        >
          <span className="border-b border-line-strong pb-0.5 transition group-hover:border-ink">{linkLabel}</span>
          <span className="flex size-10 items-center justify-center rounded-full border border-line-strong transition duration-300 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
            <ArrowUpRight className="size-4" />
          </span>
        </Link>
      )}
    </div>
  )
}
