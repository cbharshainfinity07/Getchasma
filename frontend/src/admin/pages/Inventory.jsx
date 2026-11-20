import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Boxes, AlertTriangle, PackageX, IndianRupee, History, SlidersHorizontal } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatDateTime, formatNumber, formatPrice } from '../../lib/format'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Overlay'
import { EmptyState, ErrorState, Badge } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, StatCard, SearchInput, FilterTabs, Table, Th, Td, TableSkeleton, Pagination, StockBadge, Thumb } from '../ui'

const REASONS = { initial: 'Initial stock', restock: 'Restock', adjustment: 'Adjustment', order: 'Order', cancellation: 'Cancellation', refund: 'Return', correction: 'Correction' }

function AdjustModal({ product, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ mode: 'add', quantity: '', reason: 'restock', note: '', threshold: product.lowStockThreshold })
  const qty = Number(form.quantity) || 0
  const next = form.mode === 'add' ? product.stock + qty : form.mode === 'remove' ? product.stock - qty : qty
  const m = useMutation({
    mutationFn: async () => {
      if (Number(form.threshold) !== product.lowStockThreshold) {
        await api.patch(`/admin/inventory/${product.id}/threshold`, { lowStockThreshold: Number(form.threshold) })
      }
      if (form.quantity !== '' && !(form.mode !== 'set' && qty === 0)) {
        return api.post(`/admin/inventory/${product.id}/adjust`, { mode: form.mode, quantity: qty, reason: form.mode === 'add' ? 'restock' : form.reason, note: form.note })
      }
    },
    onSuccess: () => {
      toast.success(`Stock updated for ${product.name}`)
      qc.invalidateQueries({ queryKey: ['admin'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      onClose()
    },
    onError: (e) => toast.error(e.message),
  })
  return (
    <Modal
      open
      onClose={onClose}
      title="Update stock"
      description={`${product.name} · ${product.sku}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" loading={m.isPending} disabled={next < 0} onClick={() => m.mutate()}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 rounded-xl bg-paper p-1 text-sm font-medium">
          {[['add', 'Add stock'], ['remove', 'Remove'], ['set', 'Set exact']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setForm({ ...form, mode: k, reason: k === 'add' ? 'restock' : 'adjustment' })} className={cn('rounded-lg py-2 transition', form.mode === k ? 'bg-white shadow-sm' : 'text-muted')}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={form.mode === 'set' ? 'New quantity' : 'Quantity'}>
            {(p) => <Input {...p} type="number" min="0" step="1" autoFocus value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />}
          </Field>
          {form.mode !== 'add' ? (
            <Field label="Reason">
              {(p) => (
                <Select {...p} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                  <option value="adjustment">Adjustment</option>
                  <option value="correction">Stock count correction</option>
                  <option value="restock">Restock</option>
                </Select>
              )}
            </Field>
          ) : (
            <Field label="Low-stock alert at">
              {(p) => <Input {...p} type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />}
            </Field>
          )}
        </div>
        <Field label="Note" hint="Optional">
          {(p) => <Textarea {...p} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. PO #1042 from supplier" />}
        </Field>
        <div className={cn('flex items-center justify-between rounded-xl px-4 py-3 text-sm', next < 0 ? 'bg-danger-soft text-danger' : 'bg-paper')}>
          <span>Stock after update</span>
          <span className="font-semibold tabular-nums">
            {product.stock} → {next < 0 ? 'invalid' : next}
          </span>
        </div>
      </div>
    </Modal>
  )
}

function HistoryPanel({ productId }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory-history', productId, page],
    queryFn: () => api.get('/admin/inventory/history', { productId, page, limit: 15 }),
    placeholderData: keepPreviousData,
  })
  if (isLoading) return <TableSkeleton rows={5} cols={4} />
  if (!data.items.length) return <EmptyState compact icon={History} title="No stock movements yet" />
  return (
    <>
      <Table>
        <thead>
          <tr><Th>When</Th><Th>Product</Th><Th>Reason</Th><Th className="text-right">Change</Th><Th className="text-right">Stock after</Th><Th>By / ref</Th></tr>
        </thead>
        <tbody>
          {data.items.map((m) => (
            <tr key={m.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(m.createdAt)}</Td>
              <Td>
                <Link to={`/admin/products/${m.productId}`} className="font-medium hover:underline">{m.productName}</Link>
                <p className="text-xs text-muted">{m.sku}</p>
              </Td>
              <Td>
                <Badge tone={m.reason === 'order' ? 'info' : m.change > 0 ? 'success' : 'neutral'}>{REASONS[m.reason] || m.reason}</Badge>
                {m.note && m.reason !== 'order' && <p className="mt-1 max-w-[200px] truncate text-xs text-muted" title={m.note}>{m.note}</p>}
              </Td>
              <Td className={cn('text-right font-semibold tabular-nums', m.change > 0 ? 'text-success' : 'text-danger')}>{m.change > 0 ? `+${m.change}` : m.change}</Td>
              <Td className="text-right tabular-nums">{m.stockAfter}</Td>
              <Td className="text-xs text-muted">{m.orderNumber || m.user || 'System'}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} label="movements" />
    </>
  )
}

export default function Inventory() {
  const [params, setParams] = useSearchParams()
  const [adjusting, setAdjusting] = useState(null)
  const [tab, setTab] = useState('stock')
  const f = { q: params.get('q') || '', stock: params.get('stock') || '', page: Number(params.get('page')) || 1 }
  const set = (patch) => {
    const n = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)))
    if (!('page' in patch)) n.delete('page')
    setParams(n, { replace: true })
  }
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'inventory', f],
    queryFn: () => api.get('/admin/inventory', { ...f, limit: 25 }),
    placeholderData: keepPreviousData,
  })
  const s = data?.summary

  return (
    <>
      <PageHeader title="Inventory" description="Track stock levels, restock products and review every stock movement." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard loading={isLoading} label="Units in stock" icon={Boxes} value={s && formatNumber(s.units)} hint={s && `${s.products} active products`} />
        <StatCard loading={isLoading} label="Stock value (retail)" icon={IndianRupee} value={s && formatPrice(s.value)} />
        <StatCard loading={isLoading} label="Low stock" icon={AlertTriangle} tone="warning" value={s?.lowStock} hint="At or below alert level" />
        <StatCard loading={isLoading} label="Out of stock" icon={PackageX} tone="warning" value={s?.outOfStock} hint="Not purchasable" />
      </div>

      <div className="mb-4 flex rounded-xl border border-line bg-white p-1 text-sm font-medium sm:inline-flex">
        {[['stock', 'Stock levels', SlidersHorizontal], ['history', 'History', History]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-1.5 transition', tab === k ? 'bg-ink text-white' : 'text-muted')}>
            <Icon className="size-3.5" /> {l}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <Card padded={false}>
          <HistoryPanel />
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs
              value={f.stock}
              onChange={(stock) => set({ stock })}
              options={[
                { value: '', label: 'All' },
                { value: 'low', label: 'Low stock', count: s?.lowStock },
                { value: 'out', label: 'Out of stock', count: s?.outOfStock },
              ]}
            />
            <SearchInput value={f.q} onChange={(q) => set({ q })} placeholder="Search product or SKU…" className="sm:w-72" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {isError ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : isLoading ? (
              <TableSkeleton />
            ) : data.items.length === 0 ? (
              <EmptyState icon={Boxes} title={f.stock ? 'Nothing here — stock is healthy' : 'No products found'} />
            ) : (
              <>
                <Table>
                  <thead>
                    <tr><Th>Product</Th><Th>Status</Th><Th className="text-right">Alert at</Th><Th className="text-right">In stock</Th><Th className="text-right">Value</Th><Th /></tr>
                  </thead>
                  <tbody>
                    {data.items.map((p) => (
                      <tr key={p.id} className="hover:bg-paper/50">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Thumb src={p.images[0]?.url} />
                            <div>
                              <Link to={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                              <p className="text-xs text-muted">{p.sku}</p>
                            </div>
                          </div>
                        </Td>
                        <Td className="capitalize text-muted">{p.status}</Td>
                        <Td className="text-right tabular-nums text-muted">{p.lowStockThreshold}</Td>
                        <Td className="text-right"><StockBadge stock={p.stock} threshold={p.lowStockThreshold} /></Td>
                        <Td className="text-right tabular-nums text-muted">{formatPrice(p.stock * p.effectivePrice)}</Td>
                        <Td className="text-right">
                          <Button variant="secondary" size="xs" onClick={() => setAdjusting(p)}>Update</Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(page) => set({ page: String(page) })} label="products" />
              </>
            )}
          </div>
        </>
      )}
      {adjusting && <AdjustModal product={adjusting} onClose={() => setAdjusting(null)} />}
    </>
  )
}
