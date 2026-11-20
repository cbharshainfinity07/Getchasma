import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, ShoppingBag } from 'lucide-react'
import { api } from '../../lib/api'
import { formatDate, formatPrice, timeAgo } from '../../lib/format'
import { Textarea } from '../../components/ui/Field'
import { ErrorState, PageLoader, Badge, EmptyState } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, StatCard, Table, Th, Td, OrderStatusBadge, PaymentBadge } from '../ui'

export default function CustomerDetail() {
  const { id } = useParams()
  const { data: c, isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'customer', id], queryFn: () => api.get(`/admin/customers/${id}`) })
  const [notes, setNotes] = useState('')
  useEffect(() => setNotes(c?.notes || ''), [c?.notes])
  const save = useMutation({ mutationFn: () => api.patch(`/admin/customers/${id}`, { notes }), onSuccess: () => toast.success('Notes saved'), onError: (e) => toast.error(e.message) })

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState error={error} onRetry={refetch} />

  return (
    <>
      <PageHeader
        back={{ to: '/admin/customers', label: 'Customers' }}
        title={
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{c.name.charAt(0).toUpperCase()}</span>
            {c.name}
            {c.hasAccount ? <Badge tone="info">Registered</Badge> : <Badge>Guest</Badge>}
          </span>
        }
        description={`Customer since ${formatDate(c.createdAt)}`}
        actions={<Button variant="secondary" size="sm" href={`mailto:${c.email}`}><Mail className="size-3.5" /> Email customer</Button>}
      />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total spent" value={formatPrice(c.totalSpent)} hint="Net of refunds & cancellations" />
        <StatCard label="Orders" value={c.orderCount} />
        <StatCard label="Average order" value={formatPrice(c.averageOrder)} />
        <StatCard label="Last order" value={c.lastOrderAt ? timeAgo(c.lastOrderAt) : '—'} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card title="Order history" padded={false}>
          {c.orders.length === 0 ? (
            <EmptyState compact icon={ShoppingBag} title="No orders yet" />
          ) : (
            <Table>
              <thead>
                <tr><Th>Order</Th><Th>Date</Th><Th>Status</Th><Th>Payment</Th><Th className="text-right">Items</Th><Th className="text-right">Total</Th></tr>
              </thead>
              <tbody>
                {c.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-paper/50">
                    <Td><Link to={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></Td>
                    <Td className="text-muted">{formatDate(o.createdAt)}</Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td><PaymentBadge status={o.paymentStatus} /></Td>
                    <Td className="text-right tabular-nums">{o.itemCount}</Td>
                    <Td className="text-right font-medium tabular-nums">{formatPrice(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <div className="space-y-4">
          <Card title="Contact">
            <div className="space-y-3 text-sm">
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:underline"><Mail className="size-4 text-muted" />{c.email}</a>
              {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:underline"><Phone className="size-4 text-muted" />{c.phone}</a>}
            </div>
          </Card>
          {c.addresses.length > 0 && (
            <Card title="Addresses">
              <ul className="space-y-3 text-sm">
                {c.addresses.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted" />
                    <span>{a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.postalCode}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {c.favouriteProducts.length > 0 && (
            <Card title="Most purchased">
              <ul className="space-y-2 text-sm">
                {c.favouriteProducts.map((p) => (
                  <li key={p.name} className="flex justify-between"><span>{p.name}</span><span className="text-muted">×{p.qty}</span></li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Internal notes" description="Only visible to staff">
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, prescription details, follow-ups…" />
            <Button size="sm" variant="secondary" className="mt-3" loading={save.isPending} onClick={() => save.mutate()} disabled={notes === (c.notes || '')}>Save notes</Button>
          </Card>
        </div>
      </div>
    </>
  )
}
