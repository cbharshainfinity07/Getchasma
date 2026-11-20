import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Eye, EyeOff, Trash2, Star, Package, ExternalLink } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatPrice } from '../../lib/format'
import { Checkbox, Select } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/Overlay'
import { EmptyState, ErrorState } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { PageHeader, SearchInput, FilterTabs, Table, Th, Td, TableSkeleton, Pagination, ProductStatusBadge, StockBadge, Thumb } from '../ui'
import { useAdmin } from '../context'

function RowMenu({ product, onAction, isAdmin }) {
  const [open, setOpen] = useState(false)
  const items = [
    { label: 'Edit', icon: Pencil, action: 'edit' },
    product.status === 'published' ? { label: 'Unpublish', icon: EyeOff, action: 'unpublish' } : { label: 'Publish', icon: Eye, action: 'publish' },
    { label: 'View in store', icon: ExternalLink, action: 'view', hidden: product.status !== 'published' },
    { label: 'Delete', icon: Trash2, action: 'delete', danger: true, hidden: !isAdmin },
  ].filter((i) => !i.hidden)
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink" aria-label={`Actions for ${product.name}`} aria-expanded={open}>
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-pop" role="menu">
          {items.map(({ label, icon: Icon, action, danger }) => (
            <button
              key={action}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onAction(action, product)
              }}
              className={cn('flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-paper', danger && 'text-danger')}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Products() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAdmin } = useAdmin()
  const [selected, setSelected] = useState([])
  const [confirm, setConfirm] = useState(null) // { ids, label }

  const filters = {
    q: params.get('q') || '',
    status: params.get('status') || '',
    stock: params.get('stock') || '',
    categoryId: params.get('categoryId') || '',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page')) || 1,
  }
  const set = (patch) => {
    const n = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)))
    if (!('page' in patch)) n.delete('page')
    setParams(n, { replace: true })
    setSelected([])
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => api.get('/admin/products', { ...filters, limit: 20 }),
    placeholderData: keepPreviousData,
  })
  const { data: categories = [] } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api.get('/admin/categories') })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] })
    qc.invalidateQueries({ queryKey: ['products'] })
  }
  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/products/${id}/status`, { status }),
    onSuccess: (p) => {
      toast.success(`${p.name} is now ${p.status === 'published' ? 'live' : p.status}`)
      invalidate()
    },
    onError: (e) => toast.error(e.message),
  })
  const bulk = useMutation({
    mutationFn: ({ ids, action }) => api.post('/admin/products/bulk', { ids, action }),
    onSuccess: (r, v) => {
      toast.success(`${r.affected} product${r.affected === 1 ? '' : 's'} updated`)
      if (v.action === 'publish' && r.affected < v.ids.length) toast.warning('Products without images were skipped — add an image before publishing.')
      setSelected([])
      setConfirm(null)
      invalidate()
    },
    onError: (e) => toast.error(e.message),
  })
  const del = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted')
      setConfirm(null)
      invalidate()
    },
    onError: (e) => toast.error(e.message),
  })

  const onAction = (action, p) => {
    if (action === 'edit') navigate(`/admin/products/${p.id}`)
    if (action === 'view') window.open(`/product/${p.slug}`, '_blank')
    if (action === 'publish') statusMut.mutate({ id: p.id, status: 'published' })
    if (action === 'unpublish') statusMut.mutate({ id: p.id, status: 'draft' })
    if (action === 'delete') setConfirm({ ids: [p.id], label: p.name, single: true })
  }

  const items = data?.items || []
  const counts = data?.counts || {}
  const allChecked = items.length > 0 && items.every((p) => selected.includes(p.id))

  return (
    <>
      <PageHeader
        title="Products"
        description="Create, edit, publish and price everything in your catalogue."
        actions={
          <Button size="sm" to="/admin/products/new">
            <Plus className="size-4" /> Add product
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <FilterTabs
          value={filters.status}
          onChange={(v) => set({ status: v })}
          options={[
            { value: '', label: 'All', count: Object.values(counts).reduce((a, b) => a + b, 0) },
            { value: 'published', label: 'Published', count: counts.published || 0 },
            { value: 'draft', label: 'Drafts', count: counts.draft || 0 },
            { value: 'archived', label: 'Archived', count: counts.archived || 0 },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SearchInput value={filters.q} onChange={(q) => set({ q })} placeholder="Search name, SKU, material…" className="sm:w-64" />
          <Select value={filters.categoryId} onChange={(e) => set({ categoryId: e.target.value })} className="sm:w-40" aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={filters.stock} onChange={(e) => set({ stock: e.target.value })} className="sm:w-36" aria-label="Stock">
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </Select>
          <Select value={filters.sort} onChange={(e) => set({ sort: e.target.value })} className="sm:w-40" aria-label="Sort">
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="price_desc">Price high–low</option>
            <option value="price_asc">Price low–high</option>
            <option value="popular">Best selling</option>
            <option value="stock_asc">Stock low–high</option>
          </Select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-white">
          <span className="mr-2 font-medium">{selected.length} selected</span>
          <button onClick={() => bulk.mutate({ ids: selected, action: 'publish' })} className="rounded-lg px-2.5 py-1 hover:bg-white/10">Publish</button>
          <button onClick={() => bulk.mutate({ ids: selected, action: 'unpublish' })} className="rounded-lg px-2.5 py-1 hover:bg-white/10">Unpublish</button>
          <button onClick={() => bulk.mutate({ ids: selected, action: 'archive' })} className="rounded-lg px-2.5 py-1 hover:bg-white/10">Archive</button>
          {isAdmin && (
            <button onClick={() => setConfirm({ ids: selected, label: `${selected.length} products` })} className="rounded-lg px-2.5 py-1 text-red-300 hover:bg-white/10">
              Delete
            </button>
          )}
          <button onClick={() => setSelected([])} className="ml-auto text-white/60 hover:text-white">Clear</button>
        </div>
      )}

      <div className={cn('overflow-hidden rounded-2xl border border-line bg-white', isFetching && !isLoading && 'opacity-70')}>
        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={filters.q || filters.status || filters.stock ? 'No products match' : 'No products yet'}
            description={filters.q || filters.status || filters.stock ? 'Try different filters or search terms.' : 'Add your first frame to start selling.'}
            action={<Button size="sm" to="/admin/products/new"><Plus className="size-4" /> Add product</Button>}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th className="w-10">
                    <Checkbox checked={allChecked} onChange={(v) => setSelected(v ? items.map((p) => p.id) : [])} />
                  </Th>
                  <Th>Product</Th>
                  <Th>Status</Th>
                  <Th>Category</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Stock</Th>
                  <Th className="text-right">Sold</Th>
                  <Th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className={cn('transition hover:bg-paper/50', selected.includes(p.id) && 'bg-paper/70')}>
                    <Td>
                      <Checkbox checked={selected.includes(p.id)} onChange={(v) => setSelected((s) => (v ? [...s, p.id] : s.filter((x) => x !== p.id)))} />
                    </Td>
                    <Td>
                      <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <Thumb src={p.images[0]?.url} className="size-11" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-medium hover:underline">
                            {p.name}
                            {p.isFeatured && <Star className="size-3 fill-accent text-accent" aria-label="Featured" />}
                          </p>
                          <p className="text-xs text-muted">{p.sku}{p.isBestseller && ' · Best seller'}</p>
                        </div>
                      </Link>
                    </Td>
                    <Td><ProductStatusBadge status={p.status} /></Td>
                    <Td className="text-muted">{p.category?.name || '—'}</Td>
                    <Td className="text-right tabular-nums">
                      <span className="font-medium">{formatPrice(p.effectivePrice)}</span>
                      {p.salePrice && <span className="block text-xs text-subtle line-through">{formatPrice(p.price)}</span>}
                    </Td>
                    <Td className="text-right"><StockBadge stock={p.stock} threshold={p.lowStockThreshold} /></Td>
                    <Td className="text-right tabular-nums text-muted">{p.soldCount}</Td>
                    <Td><RowMenu product={p} onAction={onAction} isAdmin={isAdmin} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(page) => set({ page: String(page) })} label="products" />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        loading={del.isPending || bulk.isPending}
        onConfirm={() => (confirm.single ? del.mutate(confirm.ids[0]) : bulk.mutate({ ids: confirm.ids, action: 'delete' }))}
        title={`Delete ${confirm?.label}?`}
        description="This permanently removes the product and its images. Past orders keep their line items. Consider archiving instead if you may sell it again."
        confirmLabel="Delete permanently"
      />
    </>
  )
}
