import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, FolderTree, ListChecks, ExternalLink } from 'lucide-react'
import { api } from '../../lib/api'
import { Field, Input, Textarea, Switch, Checkbox } from '../../components/ui/Field'
import { Modal, ConfirmDialog } from '../../components/ui/Overlay'
import { EmptyState, ErrorState, Badge, PageLoader } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { PageHeader, ImageUploader, SearchInput, Thumb } from '../ui'
import { useAdmin } from '../context'

function CategoryModal({ category, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '',
    sortOrder: category?.sortOrder ?? 0,
    isActive: category?.isActive ?? true,
  })
  const m = useMutation({
    mutationFn: (b) => (category ? api.put(`/admin/categories/${category.id}`, b) : api.post('/admin/categories', b)),
    onSuccess: () => {
      toast.success(category ? 'Category updated' : 'Category created')
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
  })
  const err = (k) => m.error?.fields?.[k]
  return (
    <Modal
      open
      onClose={onClose}
      title={category ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={m.isPending} onClick={() => m.mutate({ ...form, sortOrder: Number(form.sortOrder) || 0 })}>
            {category ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {m.isError && !Object.keys(m.error.fields).length && <p className="text-sm text-danger">{m.error.message}</p>}
        <Field label="Name" required error={err('name')}>
          {(p) => <Input {...p} autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={err('name')} />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="URL slug" hint="Auto from name" error={err('slug')}>
            {(p) => <Input {...p} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="sunglasses" />}
          </Field>
          <Field label="Sort order" error={err('sortOrder')}>
            {(p) => <Input {...p} type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />}
          </Field>
        </div>
        <Field label="Description" error={err('description')}>
          {(p) => <Textarea {...p} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Category image</p>
          <ImageUploader single value={form.image ? [{ url: form.image }] : []} onChange={(v) => setForm({ ...form, image: v[0]?.url || '' })} error={err('image')} />
        </div>
        <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Visible in store" description="Hidden categories don’t appear in menus" />
      </div>
    </Modal>
  )
}

function AssignModal({ category, onClose }) {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'products', 'all-for-assign'], queryFn: () => api.get('/admin/products', { limit: 100, sort: 'name' }) })
  const [selected, setSelected] = useState(null)
  const items = data?.items || []
  const current = selected ?? items.filter((p) => p.categoryId === category.id).map((p) => p.id)
  const m = useMutation({
    mutationFn: () => api.put(`/admin/categories/${category.id}/products`, { productIds: current }),
    onSuccess: () => {
      toast.success('Products updated')
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (e) => toast.error(e.message),
  })
  const shown = items.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
  const toggle = (id) => setSelected(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Products in ${category.name}`}
      description="Selected products will be moved into this category."
      footer={
        <>
          <span className="mr-auto self-center text-sm text-muted">{current.length} selected</span>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={m.isPending} onClick={() => m.mutate()}>Save</Button>
        </>
      }
    >
      <SearchInput value={q} onChange={setQ} placeholder="Filter products…" className="mb-4" />
      {isLoading ? (
        <PageLoader />
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <Checkbox checked={current.includes(p.id)} onChange={() => toggle(p.id)} />
              <Thumb src={p.images[0]?.url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">{p.sku}</p>
              </div>
              {p.category && p.categoryId !== category.id && <Badge>{p.category.name}</Badge>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

export default function Categories() {
  const qc = useQueryClient()
  const { isAdmin } = useAdmin()
  const [editing, setEditing] = useState(null) // category | 'new'
  const [assigning, setAssigning] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { data = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api.get('/admin/categories') })
  const del = useMutation({
    mutationFn: (c) => api.delete(`/admin/categories/${c.id}?force=true`),
    onSuccess: () => {
      toast.success('Category deleted')
      setDeleting(null)
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise products into collections shown in the storefront menus and homepage."
        actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" /> New category</Button>}
      />
      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <PageLoader />
      ) : data.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Create collections like Sunglasses or Eyeglasses." action={<Button size="sm" onClick={() => setEditing('new')}>Create category</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <div key={c.id} className="group overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative aspect-[16/9] bg-paper">
                {c.image ? <img src={c.image} alt="" className="size-full object-cover" /> : <FolderTree className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-subtle" />}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {!c.isActive && <Badge tone="warning">Hidden</Badge>}
                  <Badge tone="dark">#{c.sortOrder}</Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-xs text-muted">/{c.slug} · {c.productCount} products</p>
                  </div>
                  <a href={`/shop/${c.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink" aria-label="View in store">
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
                {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Button variant="secondary" size="xs" onClick={() => setEditing(c)}><Pencil className="size-3" /> Edit</Button>
                  <Button variant="secondary" size="xs" onClick={() => setAssigning(c)}><ListChecks className="size-3" /> Products</Button>
                  {isAdmin && <Button variant="dangerGhost" size="xs" onClick={() => setDeleting(c)}><Trash2 className="size-3" /> Delete</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <CategoryModal category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {assigning && <AssignModal category={assigning} onClose={() => setAssigning(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => del.mutate(deleting)}
        loading={del.isPending}
        title={`Delete ${deleting?.name}?`}
        description={deleting?.productCount ? `${deleting.productCount} product(s) in this category will become uncategorised. They stay in your catalogue.` : 'This category has no products.'}
        confirmLabel="Delete category"
      />
    </>
  )
}
