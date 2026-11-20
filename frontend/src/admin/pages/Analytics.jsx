import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { IndianRupee, ShoppingCart, Receipt, Users, Repeat } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatNumber, formatPrice, PAYMENT_METHOD } from '../../lib/format'
import { ErrorState } from '../../components/ui/Feedback'
import { Card, PageHeader, StatCard, pctChange, Table, Th, Td, OrderStatusBadge, Thumb } from '../ui'
import { TrendChart, RankBars } from '../charts'

const RANGES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
]

export default function Analytics() {
  const [range, setRange] = useState('30d')
  const [metric, setMetric] = useState('revenue')
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: () => api.get('/admin/analytics', { range }),
    placeholderData: keepPreviousData,
  })
  if (isError) return <ErrorState error={error} onRetry={refetch} />
  const k = data?.kpis
  const p = data?.previous
  const label = RANGES.find((r) => r.value === range).label

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Net sales exclude cancelled and refunded orders. Comparisons are against the previous period of equal length."
        actions={
          <div className="flex rounded-xl border border-line bg-white p-1 text-[13px] font-medium">
            {RANGES.map((r) => (
              <button key={r.value} onClick={() => setRange(r.value)} className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 transition', range === r.value ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      <div className={cn('transition-opacity', isFetching && 'opacity-70')}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard loading={isLoading} label="Net sales" icon={IndianRupee} value={k && formatPrice(k.revenue)} change={k && pctChange(k.revenue, p.revenue)} hint={`vs prev ${label}`} />
          <StatCard loading={isLoading} label="Orders" icon={ShoppingCart} value={k && formatNumber(k.orders)} change={k && pctChange(k.orders, p.orders)} hint={k && `${k.units} units`} />
          <StatCard loading={isLoading} label="Avg. order value" icon={Receipt} value={k && formatPrice(k.averageOrderValue)} change={k && pctChange(k.averageOrderValue, p.averageOrderValue)} />
          <StatCard loading={isLoading} label="New customers" icon={Users} value={k && formatNumber(k.newCustomers)} change={k && pctChange(k.newCustomers, p.newCustomers)} hint={k && `${k.cancelled} cancelled orders`} />
        </div>

        <Card
          className="mt-4"
          title={`Sales over time — ${label}`}
          actions={
            <div className="flex rounded-lg bg-paper p-0.5 text-xs font-medium">
              {['revenue', 'orders'].map((m) => (
                <button key={m} onClick={() => setMetric(m)} className={cn('rounded-md px-2.5 py-1 capitalize transition', metric === m ? 'bg-white shadow-sm' : 'text-muted')}>
                  {m}
                </button>
              ))}
            </div>
          }
        >
          {isLoading ? <div className="skeleton h-[300px] rounded-xl" /> : <TrendChart data={data.series} metric={metric} height={300} />}
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Sales by category">
            {isLoading ? <div className="skeleton h-52 rounded-xl" /> : <RankBars data={data.byCategory} />}
          </Card>
          <Card title="Order status" description={`Orders placed in the last ${label}`}>
            {isLoading ? (
              <div className="skeleton h-52 rounded-xl" />
            ) : data.byStatus.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No orders in this period</p>
            ) : (
              <ul className="space-y-3">
                {data.byStatus.map((s) => {
                  const total = data.byStatus.reduce((a, b) => a + b.count, 0)
                  return (
                    <li key={s.status}>
                      <div className="flex items-center justify-between text-sm">
                        <OrderStatusBadge status={s.status} />
                        <span className="tabular-nums text-muted">{s.count} · {Math.round((s.count / total) * 100)}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                        <div className="h-full rounded-full bg-ink" style={{ width: `${(s.count / total) * 100}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
          <Card title="Customer insights">
            {isLoading ? (
              <div className="skeleton h-52 rounded-xl" />
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-paper p-3">
                    <p className="text-xs text-muted">Repeat buyers</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums"><Repeat className="size-4 text-muted" />{data.customers.repeatRate}%</p>
                    <p className="text-[11px] text-subtle">{data.customers.repeatBuyers} of {data.customers.buyers} buyers</p>
                  </div>
                  <div className="rounded-xl bg-paper p-3">
                    <p className="text-xs text-muted">Registered</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">{data.customers.registered}</p>
                    <p className="text-[11px] text-subtle">of {data.customers.total} customers</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">Payment methods</p>
                  {data.byPayment.length === 0 ? (
                    <p className="text-sm text-muted">—</p>
                  ) : (
                    data.byPayment.map((m) => (
                      <div key={m.method} className="flex justify-between py-1 text-sm">
                        <span>{PAYMENT_METHOD[m.method]}</span>
                        <span className="tabular-nums text-muted">{m.count} · {formatPrice(m.value)}</span>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted">{data.customers.newsletter} newsletter subscribers</p>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Top products" description={`By units, last ${label}`} padded={false}>
            {isLoading ? (
              <div className="skeleton m-5 h-52 rounded-xl" />
            ) : data.topProducts.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">No product sales in this period</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.topProducts.map((p, i) => (
                  <li key={p.productId ?? p.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-4 text-xs font-semibold text-subtle">{i + 1}</span>
                    <Thumb src={p.image} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="text-sm tabular-nums text-muted">{p.units} units</span>
                    <span className="w-24 text-right text-sm font-medium tabular-nums">{formatPrice(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Top customers" description={`By net spend, last ${label}`} padded={false}>
            {isLoading ? (
              <div className="skeleton m-5 h-52 rounded-xl" />
            ) : data.customers.top.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">No customer orders in this period</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.customers.top.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-paper text-xs font-semibold">{c.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <Link to={`/admin/customers/${c.id}`} className="block truncate text-sm font-medium hover:underline">{c.name}</Link>
                      <p className="truncate text-xs text-muted">{c.email}</p>
                    </div>
                    <span className="text-sm tabular-nums text-muted">{c.orders} orders</span>
                    <span className="w-24 text-right text-sm font-medium tabular-nums">{formatPrice(c.spent)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Product performance" description={`Every active product, last ${label}`} padded={false} className="mt-4">
          {isLoading ? (
            <div className="skeleton m-5 h-52 rounded-xl" />
          ) : (
            <Table>
              <thead>
                <tr><Th>Product</Th><Th>Category</Th><Th className="text-right">Units</Th><Th className="text-right">Revenue</Th><Th className="text-right">Stock</Th></tr>
              </thead>
              <tbody>
                {data.productPerformance.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/50">
                    <Td>
                      <Link to={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                      <p className="text-xs text-muted">{p.sku}</p>
                    </Td>
                    <Td className="text-muted">{p.category || '—'}</Td>
                    <Td className="text-right tabular-nums">{p.units}</Td>
                    <Td className="text-right font-medium tabular-nums">{formatPrice(p.revenue)}</Td>
                    <Td className={cn('text-right tabular-nums', p.stock <= 0 && 'text-danger')}>{p.stock}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </>
  )
}
