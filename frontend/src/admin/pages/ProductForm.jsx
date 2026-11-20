import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useBlocker } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, X, Trash2, ExternalLink, Wand2 } from 'lucide-react'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { Field, Input, Select, Switch, Textarea } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/Overlay'
import { ErrorState, PageLoader, Alert } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, ImageUploader, ProductStatusBadge } from '../ui'
import { useAdmin } from '../context'

const EMPTY = {
  name: '',
  tagline: '',
  description: '',
  price: '',
  salePrice: '',
  categoryId: '',
  material: '',
  frameShape: '',
  gender: 'unisex',
  colors: [],
  sku: '',
  stock: 0,
  lowStockThreshold: 5,
  status: 'draft',
  isFeatured: false,
  isBestseller: false,
  images: [],
}

const MATERIALS = ['Acetate', 'Metal', 'Titanium', 'Stainless Steel', 'TR90', 'Acetate & Metal', 'Wood', 'Plastic']
const SHAPES = ['Aviator', 'Wayfarer', 'Round', 'Square', 'Rectangle', 'Cat-Eye', 'Browline', 'Hexagon', 'Panto', 'Oval', 'Shield']
const PRESET_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'Gold', hex: '#C9A54C' },
  { name: 'Silver', hex: '#B8BCC2' },
  { name: 'Tortoise', hex: '#6B3F1D' },
  { name: 'Rose Gold', hex: '#D9A08B' },
  { name: 'Crystal', hex: '#E6E2DA' },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'White', hex: '#F4F4F2' },
]

/** Client-side validation mirrors the server's zod schema so errors show before submit. */
function validate(v) {
  const e = {}
  if (v.name.trim().length < 2) e.name = 'Product name is required'
  if (!(Number(v.price) > 0)) e.price = 'Enter a price greater than 0'
  if (v.salePrice !== '' && v.salePrice != null) {
    if (Number(v.salePrice) < 0) e.salePrice = 'Must be 0 or more'
    else if (Number(v.salePrice) >= Number(v.price)) e.salePrice = 'Discount price must be lower than the original price'
  }
  if (!/^[A-Za-z0-9._-]{2,40}$/.test(v.sku.trim())) e.sku = 'Letters, numbers, dot, dash and underscore only'
  if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Enter a whole number, 0 or more'
  if (!Number.isInteger(Number(v.lowStockThreshold)) || Number(v.lowStockThreshold) < 0) e.lowStockThreshold = 'Enter a whole number'
  if (v.status === 'published' && v.images.length === 0) e.images = 'Add at least one image before publishing'
  v.colors.forEach((c, i) => {
    if (!c.name.trim()) e[`colors.${i}.name`] = 'Name required'
  })
  return e
}

function ColorEditor({ colors, onChange, errors }) {
  const add = (c) => {
    if (colors.some((x) => x.name.toLowerCase() === c.name.toLowerCase())) return
    onChange([...colors, c])
  }
  return (
    <div className="space-y-3">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line-strong" style={{ background: c.hex }}>
            <input type="color" value={c.hex} onChange={(e) => onChange(colors.map((x, j) => (j === i ? { ...x, hex: e.target.value.toUpperCase() } : x)))} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`Colour swatch for ${c.name || 'colour'}`} />
          </label>
          <Input value={c.name} onChange={(e) => onChange(colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Colour name" error={errors[`colors.${i}.name`]} />
          <Input value={c.hex} onChange={(e) => onChange(colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="w-28 font-mono text-xs" aria-label="Hex value" />
          <button type="button" onClick={() => onChange(colors.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove colour">
            <X className="size-4" />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESET_COLORS.filter((p) => !colors.some((c) => c.name === p.name)).map((p) => (
          <button key={p.name} type="button" onClick={() => add(p)} className="flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-2.5 text-xs transition hover:border-ink">
            <span className="size-4 rounded-full ring-1 ring-inset ring-black/10" style={{ background: p.hex }} />
            {p.name}
          </button>
        ))}
        <button type="button" onClick={() => onChange([...colors, { name: '', hex: '#888888' }])} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted hover:text-ink">
          <Plus className="size-3.5" /> Custom
        </button>
      </div>
    </div>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAdmin } = useAdmin()
  const [values, setValues] = useState(EMPTY)
  const [initial, setInitial] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const product = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => api.get(`/admin/products/${id}`), enabled: !isNew })
  const { data: categories = [] } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api.get('/admin/categories') })

  useEffect(() => {
    if (!product.data) return
    const p = product.data
    const v = {
      name: p.name,
      tagline: p.tagline || '',
      description: p.description || '',
      price: p.price,
      salePrice: p.salePrice ?? '',
      categoryId: p.categoryId ?? '',
      material: p.material || '',
      frameShape: p.frameShape || '',
      gender: p.gender,
      colors: p.colors,
      sku: p.sku,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: p.status,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    }
    setValues(v)
    setInitial(v)
  }, [product.data])

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial])
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const set = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const bind = (k) => ({ value: values[k], onChange: (e) => set(k, e.target.value), error: errors[k] })

  const save = useMutation({
    mutationFn: (body) => (isNew ? api.post('/admin/products', body) : api.put(`/admin/products/${id}`, body)),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
      toast.success(isNew ? 'Product created' : 'Changes saved', { description: p.name })
      setInitial(values)
      if (isNew) {
        // allow navigation away without the unsaved-changes prompt
        setValues((v) => v)
        setTimeout(() => navigate(`/admin/products/${p.id}`, { replace: true }), 0)
      }
    },
    onError: (err) => {
      setErrors(err.fields || {})
      toast.error(err.message)
    },
  })
  const del = useMutation({
    mutationFn: () => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
      setInitial(values)
      setTimeout(() => navigate('/admin/products', { replace: true }), 0)
    },
    onError: (e) => toast.error(e.message),
  })

  const suggestSku = async () => {
    const { sku } = await api.get('/admin/products/sku-suggestion', { name: values.name || 'GC' })
    set('sku', sku)
  }

  const submit = (statusOverride) => {
    const v = statusOverride ? { ...values, status: statusOverride } : values
    const errs = validate(v)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Please fix the highlighted fields')
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0)
      return
    }
    if (statusOverride) setValues(v)
    save.mutate({
      ...v,
      price: Number(v.price),
      salePrice: v.salePrice === '' ? null : Number(v.salePrice),
      categoryId: v.categoryId === '' ? null : Number(v.categoryId),
      stock: Number(v.stock),
      lowStockThreshold: Number(v.lowStockThreshold),
      sku: v.sku.trim().toUpperCase(),
      colors: v.colors.filter((c) => c.name.trim()),
    })
  }

  if (!isNew && product.isLoading) return <PageLoader />
  if (!isNew && product.isError) return <ErrorState error={product.error} onRetry={product.refetch} />

  const price = Number(values.price) || 0
  const sale = values.salePrice === '' ? null : Number(values.salePrice)
  const discountPct = sale != null && price > 0 && sale < price ? Math.round(((price - sale) / price) * 100) : 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      noValidate
    >
      <PageHeader
        back={{ to: '/admin/products', label: 'Products' }}
        title={isNew ? 'Add product' : values.name || 'Edit product'}
        description={!isNew && product.data && <span className="inline-flex items-center gap-2"><ProductStatusBadge status={product.data.status} /> Last updated {new Date(product.data.updatedAt).toLocaleString('en-IN')}</span>}
        actions={
          <>
            {!isNew && product.data?.status === 'published' && (
              <Button variant="ghost" size="sm" href={`/product/${product.data.slug}`} target="_blank" rel="noreferrer">
                View <ExternalLink className="size-3.5" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/products')}>Cancel</Button>
            {values.status !== 'published' && (
              <Button variant="secondary" size="sm" loading={save.isPending && save.variables?.status === 'published'} onClick={() => submit('published')}>
                Save & publish
              </Button>
            )}
            <Button type="submit" size="sm" loading={save.isPending} disabled={!dirty && !isNew}>
              {isNew ? 'Create product' : 'Save changes'}
            </Button>
          </>
        }
      />

      {Object.keys(errors).filter((k) => errors[k]).length > 0 && (
        <Alert tone="danger" className="mb-4" title="Some fields need attention">
          {Object.values(errors).filter(Boolean).slice(0, 3).join(' · ')}
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card title="Basic information">
            <div className="space-y-4">
              <Field label="Product name" required error={errors.name}>
                {(p) => <Input {...p} {...bind('name')} placeholder="e.g. Aurelia Aviator" />}
              </Field>
              <Field label="Subtext / tagline" hint={`${values.tagline.length}/160`} error={errors.tagline} help="Short line shown under the name on the product page.">
                {(p) => <Input {...p} {...bind('tagline')} maxLength={160} placeholder="Hand-finished titanium with G-15 lenses" />}
              </Field>
              <Field label="Description" hint={`${values.description.length}/5000`} error={errors.description} help="Separate paragraphs with a blank line.">
                {(p) => <Textarea {...p} {...bind('description')} rows={7} maxLength={5000} placeholder="Describe materials, lenses, fit and what makes this frame special." />}
              </Field>
            </div>
          </Card>

          <Card title="Images" description="The first image is the cover. Drag to reorder. Up to 10 images.">
            <ImageUploader value={values.images} onChange={(imgs) => set('images', imgs)} error={errors.images} />
            {values.images.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-xs font-medium text-muted">Alt text (accessibility & SEO)</summary>
                <div className="mt-3 space-y-2">
                  {values.images.map((img, i) => (
                    <div key={img.url} className="flex items-center gap-2">
                      <img src={img.url} alt="" className="size-9 rounded-lg object-cover" />
                      <Input value={img.alt || ''} onChange={(e) => set('images', values.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder={`Describe image ${i + 1}`} className="h-9" />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Original price (MRP)" required error={errors.price}>
                {(p) => <Input {...p} {...bind('price')} type="number" min="0" step="1" inputMode="decimal" prefix="₹" />}
              </Field>
              <Field label="Discount price" hint="Optional" error={errors.salePrice}>
                {(p) => <Input {...p} {...bind('salePrice')} type="number" min="0" step="1" inputMode="decimal" prefix="₹" />}
              </Field>
              <div>
                <p className="mb-1.5 text-[13px] font-medium">Customer sees</p>
                <div className="flex h-11 items-center gap-2 rounded-xl bg-paper px-3.5 text-sm">
                  <strong>{formatPrice(sale != null && sale < price ? sale : price)}</strong>
                  {discountPct > 0 && (
                    <>
                      <span className="text-xs text-subtle line-through">{formatPrice(price)}</span>
                      <span className="text-xs font-semibold text-success">{discountPct}% off</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Attributes">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Frame material" error={errors.material}>
                {(p) => (
                  <>
                    <Input {...p} {...bind('material')} list="materials" placeholder="Acetate" />
                    <datalist id="materials">{MATERIALS.map((m) => <option key={m} value={m} />)}</datalist>
                  </>
                )}
              </Field>
              <Field label="Frame shape" error={errors.frameShape}>
                {(p) => (
                  <>
                    <Input {...p} {...bind('frameShape')} list="shapes" placeholder="Aviator" />
                    <datalist id="shapes">{SHAPES.map((m) => <option key={m} value={m} />)}</datalist>
                  </>
                )}
              </Field>
              <Field label="Gender">
                {(p) => (
                  <Select {...p} value={values.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="unisex">Unisex</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </Select>
                )}
              </Field>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-[13px] font-medium">Available colours</p>
              <ColorEditor colors={values.colors} onChange={(c) => set('colors', c)} errors={errors} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Status & visibility">
            <div className="space-y-4">
              <Field label="Product status">
                {(p) => (
                  <Select {...p} value={values.status} onChange={(e) => set('status', e.target.value)}>
                    <option value="draft">Draft — hidden from store</option>
                    <option value="published">Published — visible in store</option>
                    <option value="archived">Archived</option>
                  </Select>
                )}
              </Field>
              <Switch checked={values.isFeatured} onChange={(v) => set('isFeatured', v)} label="Featured" description="Show in homepage featured rail & spotlight" />
              <Switch checked={values.isBestseller} onChange={(v) => set('isBestseller', v)} label="Best seller" description="Show the best-seller badge and rail" />
            </div>
          </Card>

          <Card title="Organisation">
            <Field label="Category" error={errors.categoryId}>
              {(p) => (
                <Select {...p} value={values.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              )}
            </Field>
          </Card>

          <Card title="Inventory">
            <div className="space-y-4">
              <Field label="SKU" required error={errors.sku}>
                {(p) => (
                  <div className="flex gap-2">
                    <Input {...p} {...bind('sku')} className="font-mono uppercase" placeholder="GC-AUR-001" />
                    <Button type="button" variant="secondary" size="icon" className="shrink-0 rounded-xl" onClick={suggestSku} aria-label="Generate SKU" title="Generate SKU">
                      <Wand2 className="size-4" />
                    </Button>
                  </div>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock quantity" required error={errors.stock}>
                  {(p) => <Input {...p} {...bind('stock')} type="number" min="0" step="1" inputMode="numeric" />}
                </Field>
                <Field label="Low-stock alert" error={errors.lowStockThreshold}>
                  {(p) => <Input {...p} {...bind('lowStockThreshold')} type="number" min="0" step="1" inputMode="numeric" />}
                </Field>
              </div>
              {!isNew && <p className="text-xs text-muted">Stock changes made here are logged in inventory history.</p>}
            </div>
          </Card>

          {!isNew && isAdmin && (
            <Card title="Danger zone">
              <p className="text-sm text-muted">Deleting removes the product permanently. Archive instead to keep it out of the store.</p>
              <Button variant="dangerGhost" size="sm" className="mt-3 -ml-3" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-3.5" /> Delete product
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => del.mutate()}
        loading={del.isPending}
        title={`Delete ${values.name}?`}
        description="This can’t be undone. Past orders keep their line items."
        confirmLabel="Delete permanently"
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        title="Discard unsaved changes?"
        description="You have changes that haven’t been saved."
        confirmLabel="Discard"
      />
    </form>
  )
}
