import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { api } from '../../lib/api'
import { formatDate, formatPrice, timeAgo } from '../../lib/format'
import { Select } from '../../components/ui/Field'
import { EmptyState, ErrorState, Badge } from '../../components/ui/Feedback'
import { PageHeader, SearchInput, FilterTabs, Table, Th, Td, TableSkeleton, Pagination } from '../ui'

export default function Customers() {
  const [params, setParams] = useSearchParams()
  const f = { q: params.get('q') || '', type: params.get('type') || '', sort: params.get('sort') || 'recent', page: Number(params.get('page')) || 1 }
  const set = (patch) => {
    const n = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)))
    if (!('page' in patch)) n.delete('page')
    setParams(n, { replace: true })
  }
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'customers', f],
    queryFn: () => api.get('/admin/customers', { ...f, limit: 20 }),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader title="Customers" description="Everyone who has ordered or created an account." />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          value={f.type}
          onChange={(type) => set({ type })}
          options={[
            { value: '', label: 'All' },
            { value: 'registered', label: 'Registered' },
            { value: 'guest', label: 'Guests' },
          ]}
        />
        <div className="flex gap-2">
          <SearchInput value={f.q} onChange={(q) => set({ q })} placeholder="Name, email or phone…" className="sm:w-64" />
          <Select value={f.sort} onChange={(e) => set({ sort: e.target.value })} className="w-44" aria-label="Sort">
            <option value="recent">Recent activity</option>
            <option value="spent">Top spenders</option>
            <option value="orders">Most orders</option>
            <option value="name">Name A–Z</option>
            <option value="newest">Newest</option>
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState icon={Users} title={f.q ? 'No customers match' : 'No customers yet'} description="Customers are created automatically when they order or register." />
        ) : (
          <>
            <Table>
              <thead>
                <tr><Th>Customer</Th><Th>Phone</Th><Th>Type</Th><Th className="text-right">Orders</Th><Th className="text-right">Total spent</Th><Th>Last order</Th><Th>Since</Th></tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-paper/50">
                    <Td>
                      <Link to={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium hover:underline">{c.name}</p>
                          <p className="truncate text-xs text-muted">{c.email}</p>
                        </div>
                      </Link>
                    </Td>
                    <Td className="text-muted">{c.phone || '—'}</Td>
                    <Td>{c.hasAccount ? <Badge tone="info">Registered</Badge> : <Badge>Guest</Badge>}</Td>
                    <Td className="text-right tabular-nums">{c.orderCount}</Td>
                    <Td className="text-right font-medium tabular-nums">{formatPrice(c.totalSpent)}</Td>
                    <Td className="whitespace-nowrap text-muted">{c.lastOrderAt ? timeAgo(c.lastOrderAt) : '—'}</Td>
                    <Td className="whitespace-nowrap text-muted">{formatDate(c.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={(page) => set({ page: String(page) })} label="customers" />
          </>
        )}
      </div>
    </>
  )
}
