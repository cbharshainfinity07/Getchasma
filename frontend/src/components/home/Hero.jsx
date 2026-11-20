import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useSettings } from '../../lib/queries'
import { cn } from '../../lib/format'

const SLIDE_MS = 6500
const EASE = [0.16, 1, 0.3, 1]

/**
 * Editorial hero in the luxury-eyewear tradition: white page, serif headline on the left, campaign
 * photography on the right with a slow cross-fade and gentle zoom. Keeps the approved copy, the
 * "Up To 15% Off" offer and the numbered slider.
 */
export default function Hero() {
  const { data: settings } = useSettings()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = [
    {
      eyebrow: settings?.branding?.heroEyebrow || 'Up To 15% Off',
      title: settings?.branding?.heroTitle || 'Perfect Glasses For Your Unique Style',
      sub: 'Hand-finished frames with UV400 and blue-cut lenses, delivered free across India.',
      image: '/hot-5.jpg',
      alt: 'Model wearing slim black rectangle sunglasses',
      primary: { label: 'Shop the collection', to: '/shop' },
      secondary: { label: 'View offers', to: '/shop?onSale=true' },
    },
    {
      eyebrow: 'The gold edit',
      title: 'Quiet Gold, Effortless Presence',
      sub: 'Compact pilots and fine metal rims, made to be worn every day.',
      image: '/hot-3.jpg',
      alt: 'Model wearing compact gold aviator sunglasses',
      primary: { label: 'Shop aviators', to: '/shop?shapes=Aviator' },
      secondary: { label: 'All sunglasses', to: '/shop/sunglasses' },
    },
    {
      eyebrow: 'New season',
      title: 'Warm Tints For Long Summer Days',
      sub: 'Translucent acetate in amber and honey, with lenses to match.',
      image: '/hot-1.jpg',
      alt: 'Model wearing amber tinted square sunglasses',
      primary: { label: 'Shop new arrivals', to: '/shop?sort=newest' },
      secondary: { label: 'Square frames', to: '/shop?shapes=Square' },
    },
  ]
  const slide = slides[index]
  const words = slide.title.split(' ')
  const accentFrom = Math.max(0, words.length - 2) // last two words set in italic

  const go = useCallback((d) => setIndex((i) => (i + d + slides.length) % slides.length), [slides.length])
  useEffect(() => {
    if (paused || reduce) return
    const t = setTimeout(() => go(1), SLIDE_MS)
    return () => clearTimeout(t)
  }, [index, paused, reduce, go])

  const touch = useRef(null)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        touch.current = null
      }}
      className="bg-white pt-[104px] md:pt-[120px]"
    >
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-16 sm:px-8 md:min-h-[calc(100dvh-120px)] md:grid-cols-12 md:items-center md:gap-10 md:pb-12 lg:gap-14">
        {/* Copy */}
        <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div key={index} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted"
              >
                {slide.eyebrow}
              </motion.p>
              <h1 className="mt-6 text-[clamp(2.5rem,5vw,5.4rem)] font-normal leading-[1.02] tracking-[-0.02em] text-ink">
                {words.map((w, i) => (
                  <span key={`${w}-${i}`} className={cn('inline-block overflow-hidden pb-[0.12em] align-bottom', i < words.length - 1 && 'mr-[0.22em]')}>
                    <motion.span
                      className={i >= accentFrom ? 'inline-block italic' : 'inline-block'}
                      initial={reduce ? false : { y: '110%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: EASE }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-6 max-w-[38ch] text-base leading-relaxed text-muted"
              >
                {slide.sub}
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
                className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
              >
                <Link
                  to={slide.primary.to}
                  className="inline-flex h-12 items-center whitespace-nowrap bg-ink px-8 text-[12px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-ink-soft active:scale-[0.99]"
                >
                  {slide.primary.label}
                </Link>
                <Link
                  to={slide.secondary.to}
                  className="whitespace-nowrap border-b border-ink pb-1 text-[12px] font-medium uppercase tracking-[0.2em] text-ink transition hover:border-muted hover:text-muted"
                >
                  {slide.secondary.label}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Numbered slider */}
          <div className="mt-14 flex items-center gap-5 text-[12px] font-medium tracking-[0.2em] text-ink">
            <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <div className="flex w-40 gap-1.5 sm:w-48">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} className="relative flex-1 py-2" aria-label={`Go to slide ${i + 1}`} aria-current={i === index}>
                  <span className="block h-px w-full bg-line-strong" />
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-ink"
                      initial={{ width: paused || reduce ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: paused || reduce ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
            <span className="tabular-nums text-subtle">{String(slides.length).padStart(2, '0')}</span>
            <div className="ml-2 flex gap-4 uppercase text-muted">
              <button onClick={() => go(-1)} className="transition hover:text-ink" aria-label="Previous slide">Prev</button>
              <button onClick={() => go(1)} className="transition hover:text-ink" aria-label="Next slide">Next</button>
            </div>
          </div>
        </div>

        {/* Campaign image */}
        <div className="order-1 md:order-2 md:col-span-6 lg:col-span-7">
          <div className="relative h-[58svh] w-full overflow-hidden bg-paper md:h-auto md:aspect-[4/5] md:max-h-[calc(100dvh-170px)] lg:aspect-[5/6]">
            <AnimatePresence initial={false}>
              <motion.img
                key={slide.image}
                src={slide.image}
                alt={slide.alt}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.1, ease: 'easeOut' }, scale: { duration: SLIDE_MS / 1000 + 1, ease: 'easeOut' } }}
                className="absolute inset-0 size-full object-cover object-[center_30%]"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
