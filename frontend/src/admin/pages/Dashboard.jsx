import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IndianRupee, ShoppingCart, Package, Users, Clock, AlertTriangle, ArrowRight, Inbox } from 'lucide-react'
import { api } from '../../lib/api'
import { formatPrice, formatNumber, timeAgo } from '../../lib/format'
import { ErrorState, EmptyState } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, StatCard, OrderStatusBadge, Thumb, pctChange, Table, Th, Td } from '../ui'
import { TrendChart } from '../charts'
import { useAdmin } from '../context'
import { useState } from 'react'
import { cn } from '../../lib/format'

export default function Dashboard() {
  const { user } = useAdmin()
  const [metric, setMetric] = useState('revenue')
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api.get('/admin/dashboard') })

  if (isError) return <ErrorState error={error} onRetry={refetch} />
  const t = data?.totals
  const cur = data?.last30
  const prev = data?.previous30
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(' ')[0]}`}
        description="Here’s what’s happening in your store. All figures are live from your orders."
        actions={
          <Button variant="secondary" size="sm" to="/admin/analytics">
            Full analytics <ArrowRight className="size-3.5" />
          </Button>
        }
      />

      {/* Attention strip */}
      {!isLoading && (t.pendingOrders > 0 || t.lowStock + t.outOfStock > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {t.pendingOrders > 0 && (
            <Link to="/admin/orders?status=pending" className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm transition hover:border-accent">
              <Clock className="size-4 text-accent-ink" />
              <span className="flex-1"><strong>{t.pendingOrders}</strong> {t.pendingOrders === 1 ? 'order needs' : 'orders need'} confirmation</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
          {t.lowStock + t.outOfStock > 0 && (
            <Link to="/admin/inventory?stock=low" className="flex items-center gap-3 rounded-2xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm transition hover:border-warning/50">
              <AlertTriangle className="size-4 text-warning" />
              <span className="flex-1">
                <strong>{t.lowStock}</strong> low stock · <strong>{t.outOfStock}</strong> out of stock
              </span>
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard loading={isLoading} label="Total revenue" icon={IndianRupee} value={t && formatPrice(t.revenue)} change={cur && pctChange(cur.revenue, prev.revenue)} hint={cur && `${formatPrice(cur.revenue)} last 30d`} to="/admin/analytics" />
        <StatCard loading={isLoading} label="Total orders" icon={ShoppingCart} value={t && formatNumber(t.orders)} change={cur && pctChange(cur.orders, prev.orders)} hint={cur && `${cur.orders} last 30d`} to="/admin/orders" />
        <StatCard loading={isLoading} label="Products" icon={Package} value={t && formatNumber(t.products)} hint={t && `${t.publishedProducts} published`} to="/admin/products" />
        <StatCard loading={isLoading} label="Customers" icon={Users} value={t && formatNumber(t.customers)} change={cur && pctChange(cur.newCustomers, prev.newCustomers)} hint={cur && `${cur.newCustomers} new in 30d`} to="/admin/customers" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Sales — last 30 days"
          description={cur ? `${formatPrice(cur.revenue)} from ${cur.orders} orders · AOV ${formatPrice(cur.averageOrderValue)}` : ' '}
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
          {isLoading ? <div className="skeleton h-[260px] rounded-xl" /> : <TrendChart data={data.series} metric={metric} />}
        </Card>

        <Card title="Best-selling products" description="All time, by units sold" padded={false}>
          {isLoading ? (
            <div className="skeleton m-5 h-48 rounded-xl" />
          ) : data.bestSellers.length === 0 ? (
            <EmptyState compact icon={Inbox} title="No sales yet" description="Best sellers appear once orders come in." />
          ) : (
            <ul className="divide-y divide-line">
              {data.bestSellers.map((p, i) => (
                <li key={p.productId ?? p.name} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-4 text-xs font-semibold tabular-nums text-subtle">{i + 1}</span>
                  <Thumb src={p.image} />
                  <div className="min-w-0 flex-1">
                    {p.productId ? (
                      <Link to={`/admin/products/${p.productId}`} className="block truncate text-sm font-medium hover:underline">{p.name}</Link>
                    ) : (
                      <p className="truncate text-sm font-medium">{p.name}</p>
                    )}
                    <p className="text-xs text-muted">{p.units} sold · {formatPrice(p.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Recent orders"
          padded={false}
          actions={<Link to="/admin/orders" className="text-xs font-medium text-muted hover:text-ink">View all</Link>}
        >
          {isLoading ? (
            <div className="skeleton m-5 h-48 rounded-xl" />
          ) : data.recentOrders.length === 0 ? (
            <EmptyState compact icon={Inbox} title="No orders yet" description="New orders from the storefront will appear here in real time." />
          ) : (
            <Table>
              <thead>
                <tr><Th>Order</Th><Th>Customer</Th><Th>Status</Th><Th className="text-right">Total</Th></tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-paper/50">
                    <Td>
                      <Link to={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link>
                      <p className="text-xs text-muted">{timeAgo(o.createdAt)}</p>
                    </Td>
                    <Td>
                      <p>{o.customerName}</p>
                      <p className="text-xs text-muted">{o.itemCount} items</p>
                    </Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td className="text-right font-medium tabular-nums">{formatPrice(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card title="Low-stock products" padded={false} actions={<Link to="/admin/inventory?stock=low" className="text-xs font-medium text-muted hover:text-ink">Inventory</Link>}>
          {isLoading ? (
            <div className="skeleton m-5 h-48 rounded-xl" />
          ) : data.lowStockProducts.length === 0 ? (
            <EmptyState compact icon={Package} title="Stock looks healthy" description="Nothing is at or below its low-stock threshold." />
          ) : (
            <ul className="divide-y divide-line">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <Thumb src={p.image} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/products/${p.id}`} className="block truncate text-sm font-medium hover:underline">{p.name}</Link>
                    <p className="text-xs text-muted">{p.sku}</p>
                  </div>
                  <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums', p.stock <= 0 ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>
                    {p.stock <= 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!isLoading && data.statusBreakdown.length > 0 && (
        <Card title="Orders by status" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {data.statusBreakdown.map((s) => (
              <Link key={s.status} to={`/admin/orders?status=${s.status}`} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm transition hover:border-line-strong">
                <OrderStatusBadge status={s.status} />
                <span className="font-semibold tabular-nums">{s.count}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
