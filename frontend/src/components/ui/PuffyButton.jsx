import Button from './Button'

/** Kept for backwards compatibility — the original puffy CTA now maps onto the design-system Button. */
export default function PuffyButton({ children, fullWidth = false, className = '', ...props }) {
  return (
    <Button size="lg" full={fullWidth} className={className} {...props}>
      {children}
    </Button>
  )
}
