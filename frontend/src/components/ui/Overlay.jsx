import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/format'
import Button from './Button'

function useLockBody(open) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
}

function useEscape(open, onClose) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
}

/** Keep keyboard focus inside the dialog while it is open. */
function useFocusTrap(open, ref) {
  useEffect(() => {
    if (!open || !ref.current) return
    const node = ref.current
    const previously = document.activeElement
    const focusables = () =>
      [...node.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(
        (el) => el.offsetParent !== null,
      )
    const first = focusables()[0]
    ;(node.querySelector('[data-autofocus]') || first || node).focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const els = focusables()
      if (!els.length) return
      const [a, b] = [els[0], els[els.length - 1]]
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault()
        b.focus()
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault()
        a.focus()
      }
    }
    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      previously?.focus?.({ preventScroll: true })
    }
  }, [open, ref])
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  const ref = useRef(null)
  useLockBody(open)
  useEscape(open, onClose)
  useFocusTrap(open, ref)
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col overflow-hidden  bg-white shadow-pop outline-none sm:',
              widths[size],
              className,
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  {title && <h2 className="text-lg font-semibold">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line bg-paper/50 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'danger', loading, children }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
      {children}
    </Modal>
  )
}

export function Drawer({ open, onClose, side = 'right', title, children, footer, className, label }) {
  const ref = useRef(null)
  useLockBody(open)
  useEscape(open, onClose)
  useFocusTrap(open, ref)
  const from = side === 'right' ? '100%' : '-100%'
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label || (typeof title === 'string' ? title : undefined)}
            tabIndex={-1}
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={cn(
              'absolute top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-pop outline-none',
              side === 'right' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <div className="text-lg font-semibold">{title}</div>
                <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line p-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
