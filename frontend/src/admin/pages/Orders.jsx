import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Download, Inbox } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatDateTime, formatPrice, PAYMENT_METHOD, timeAgo } from '../../lib/format'
import { Select, Input } from '../../components/ui/Field'
import { EmptyState, ErrorState } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { PageHeader, SearchInput, FilterTabs, Table, Th, Td, TableSkeleton, Pagination, OrderStatusBadge, PaymentBadge } from '../ui'

const STATUS_TABS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const f = {
    q: params.get('q') || '',
    status: params.get('status') || '',
    paymentStatus: params.get('paymentStatus') || '',
    paymentMethod: params.get('paymentMethod') || '',
    from: params.get('from') || '',
    to: params.get('to') || '',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page')) || 1,
  }
  const set = (patch) => {
    const n = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)))
    if (!('page' in patch)) n.delete('page')
    setParams(n, { replace: true })
  }
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'orders', f],
    queryFn: () => api.get('/admin/orders', { ...f, limit: 20 }),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
  })
  const counts = data?.counts || {}
  const items = data?.items || []
  const filtered = f.q || f.status || f.paymentStatus || f.paymentMethod || f.from || f.to

  return (
    <>
      <PageHeader
        title="Orders"
        description="Search, filter and fulfil customer orders."
        actions={
          <Button variant="secondary" size="sm" href="/api/admin/orders/export.csv">
            <Download className="size-3.5" /> Export CSV
          </Button>
        }
      />
      <div className="mb-3">
        <FilterTabs
          value={f.status}
          onChange={(status) => set({ status })}
          options={STATUS_TABS.map((s) => ({ value: s, label: s ? s[0].toUpperCase() + s.slice(1) : 'All', count: s ? counts[s] || 0 : counts.all || 0 }))}
        />
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <SearchInput value={f.q} onChange={(q) => set({ q })} placeholder="Order no., customer, email, phone…" className="sm:w-72" />
        <Select value={f.paymentStatus} onChange={(e) => set({ paymentStatus: e.target.value })} className="sm:w-40" aria-label="Payment status">
          <option value="">Any payment</option>
          <option value="pending">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="partially_refunded">Part refunded</option>
          <option value="refunded">Refunded</option>
        </Select>
        <Select value={f.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })} className="sm:w-40" aria-label="Payment method">
          <option value="">Any method</option>
          <option value="cod">Cash on delivery</option>
          <option value="razorpay">Online</option>
        </Select>
        <div className="flex items-center gap-2">
          <Input type="date" value={f.from} onChange={(e) => set({ from: e.target.value })} aria-label="From date" className="h-10 sm:w-40" />
          <span className="text-muted">–</span>
          <Input type="date" value={f.to} onChange={(e) => set({ to: e.target.value })} aria-label="To date" className="h-10 sm:w-40" />
        </div>
        <Select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="sm:ml-auto sm:w-44" aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="total_desc">Highest value</option>
          <option value="total_asc">Lowest value</option>
        </Select>
      </div>

      <div className={cn('overflow-hidden rounded-2xl border border-line bg-white', isFetching && !isLoading && 'opacity-70')}>
        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filtered ? 'No orders match' : 'No orders yet'}
            description={filtered ? 'Try clearing some filters.' : 'Orders placed on the storefront will appear here.'}
            action={filtered && <Button variant="secondary" size="sm" onClick={() => setParams({})}>Clear filters</Button>}
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th><Th>Date</Th><Th>Customer</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Items</Th><Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id} className="group cursor-pointer transition hover:bg-paper/50">
                    <Td>
                      <Link to={`/admin/orders/${o.id}`} className="whitespace-nowrap font-medium group-hover:underline">{o.orderNumber}</Link>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span title={formatDateTime(o.createdAt)}>{timeAgo(o.createdAt)}</span>
                    </Td>
                    <Td>
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted">{o.email}</p>
                    </Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td>
                      <PaymentBadge status={o.paymentStatus} />
                      <p className="mt-0.5 text-xs text-muted">{PAYMENT_METHOD[o.paymentMethod]}</p>
                    </Td>
                    <Td className="text-right tabular-nums">{o.itemCount}</Td>
                    <Td className="text-right font-medium tabular-nums">{formatPrice(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(page) => set({ page: String(page) })} label="orders" />
          </>
        )}
      </div>
    </>
  )
}
