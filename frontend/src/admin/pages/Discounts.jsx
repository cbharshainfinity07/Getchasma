import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, TicketPercent, Pencil, Trash2, Copy } from 'lucide-react'
import { api } from '../../lib/api'
import { formatDate, formatPrice } from '../../lib/format'
import { Field, Input, Select, Switch } from '../../components/ui/Field'
import { Modal, ConfirmDialog } from '../../components/ui/Overlay'
import { EmptyState, ErrorState, Badge } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { PageHeader, Table, Th, Td, TableSkeleton } from '../ui'
import { useAdmin } from '../context'

const STATE = {
  active: ['Active', 'success'],
  scheduled: ['Scheduled', 'info'],
  expired: ['Expired', 'neutral'],
  exhausted: ['Used up', 'neutral'],
  disabled: ['Disabled', 'warning'],
}

// <input type="datetime-local"> works in local time; the API stores ISO UTC.
const toLocal = (iso) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
const toIso = (local) => (local ? new Date(local).toISOString() : null)

function DiscountModal({ discount, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    code: discount?.code || '',
    description: discount?.description || '',
    type: discount?.type || 'percentage',
    value: discount?.value ?? '',
    minOrder: discount?.minOrder ?? 0,
    maxUses: discount?.maxUses ?? '',
    startsAt: toLocal(discount?.startsAt),
    endsAt: toLocal(discount?.endsAt),
    isActive: discount?.isActive ?? true,
  })
  const m = useMutation({
    mutationFn: (b) => (discount ? api.put(`/admin/discounts/${discount.id}`, b) : api.post('/admin/discounts', b)),
    onSuccess: () => {
      toast.success(discount ? 'Discount updated' : 'Discount created')
      qc.invalidateQueries({ queryKey: ['admin', 'discounts'] })
      onClose()
    },
  })
  const err = (k) => m.error?.fields?.[k]
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const generate = () => setForm({ ...form, code: `GC${Math.random().toString(36).slice(2, 8).toUpperCase()}` })
  return (
    <Modal
      open
      onClose={onClose}
      title={discount ? 'Edit discount' : 'New discount code'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            loading={m.isPending}
            onClick={() =>
              m.mutate({
                ...form,
                value: Number(form.value),
                minOrder: Number(form.minOrder) || 0,
                maxUses: form.maxUses === '' ? null : Number(form.maxUses),
                startsAt: toIso(form.startsAt),
                endsAt: toIso(form.endsAt),
              })
            }
          >
            {discount ? 'Save' : 'Create code'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {m.isError && !Object.keys(m.error.fields).length && <p className="text-sm text-danger">{m.error.message}</p>}
        <Field label="Code" required error={err('code')} help="Customers enter this at checkout">
          {(p) => (
            <div className="flex gap-2">
              <Input {...p} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono uppercase" placeholder="WELCOME10" error={err('code')} />
              <Button type="button" variant="secondary" onClick={generate}>Generate</Button>
            </div>
          )}
        </Field>
        <Field label="Description" hint="Internal">
          {(p) => <Input {...p} value={form.description} onChange={set('description')} placeholder="First order offer" />}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            {(p) => (
              <Select {...p} value={form.type} onChange={set('type')}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
              </Select>
            )}
          </Field>
          <Field label="Value" required error={err('value')}>
            {(p) => <Input {...p} type="number" min="1" value={form.value} onChange={set('value')} prefix={form.type === 'fixed' ? '₹' : undefined} suffix={form.type === 'percentage' ? '%' : undefined} error={err('value')} />}
          </Field>
          <Field label="Minimum order" error={err('minOrder')}>
            {(p) => <Input {...p} type="number" min="0" value={form.minOrder} onChange={set('minOrder')} prefix="₹" />}
          </Field>
          <Field label="Usage limit" hint="Blank = unlimited" error={err('maxUses')}>
            {(p) => <Input {...p} type="number" min="1" value={form.maxUses} onChange={set('maxUses')} />}
          </Field>
          <Field label="Starts" hint="Optional" error={err('startsAt')}>
            {(p) => <Input {...p} type="datetime-local" value={form.startsAt} onChange={set('startsAt')} />}
          </Field>
          <Field label="Ends" hint="Optional" error={err('endsAt')}>
            {(p) => <Input {...p} type="datetime-local" value={form.endsAt} onChange={set('endsAt')} error={err('endsAt')} />}
          </Field>
        </div>
        <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Enabled" description="Disable to pause the code without deleting it" />
      </div>
    </Modal>
  )
}

export default function Discounts() {
  const qc = useQueryClient()
  const { isAdmin } = useAdmin()
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { data = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'discounts'], queryFn: () => api.get('/admin/discounts') })
  const toggle = useMutation({
    mutationFn: (d) => api.patch(`/admin/discounts/${d.id}/toggle`),
    onSuccess: (d) => {
      toast.success(`${d.code} ${d.isActive ? 'enabled' : 'disabled'}`)
      qc.invalidateQueries({ queryKey: ['admin', 'discounts'] })
    },
  })
  const del = useMutation({
    mutationFn: (d) => api.delete(`/admin/discounts/${d.id}`),
    onSuccess: () => {
      toast.success('Discount deleted')
      setDeleting(null)
      qc.invalidateQueries({ queryKey: ['admin', 'discounts'] })
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <>
      <PageHeader
        title="Discounts & promotions"
        description="Create percentage or fixed-amount codes with dates, minimum order values and usage limits."
        actions={<Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" /> New code</Button>}
      />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : data.length === 0 ? (
          <EmptyState icon={TicketPercent} title="No discount codes yet" description="Create a code to run a promotion." action={<Button size="sm" onClick={() => setEditing('new')}>Create code</Button>} />
        ) : (
          <Table>
            <thead>
              <tr><Th>Code</Th><Th>Discount</Th><Th>Conditions</Th><Th>Validity</Th><Th className="text-right">Used</Th><Th className="text-right">Sales</Th><Th>Status</Th><Th /></tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.id} className="hover:bg-paper/50">
                  <Td>
                    <button onClick={() => navigator.clipboard.writeText(d.code).then(() => toast.success('Code copied'))} className="flex items-center gap-1.5 font-mono font-semibold">
                      {d.code} <Copy className="size-3 text-subtle" />
                    </button>
                    {d.description && <p className="text-xs text-muted">{d.description}</p>}
                  </Td>
                  <Td className="font-medium">{d.type === 'percentage' ? `${d.value}% off` : `${formatPrice(d.value)} off`}</Td>
                  <Td className="text-muted">{d.minOrder > 0 ? `Min ${formatPrice(d.minOrder)}` : 'No minimum'}</Td>
                  <Td className="whitespace-nowrap text-xs text-muted">
                    {d.startsAt || d.endsAt ? `${d.startsAt ? formatDate(d.startsAt) : 'Now'} → ${d.endsAt ? formatDate(d.endsAt) : 'No end'}` : 'Always'}
                  </Td>
                  <Td className="text-right tabular-nums">{d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ''}</Td>
                  <Td className="text-right tabular-nums">{formatPrice(d.revenue || 0)}</Td>
                  <Td><Badge tone={STATE[d.state][1]} dot>{STATE[d.state][0]}</Badge></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Switch checked={d.isActive} onChange={() => toggle.mutate(d)} />
                      <button onClick={() => setEditing(d)} className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink" aria-label={`Edit ${d.code}`}><Pencil className="size-3.5" /></button>
                      {isAdmin && <button onClick={() => setDeleting(d)} className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger" aria-label={`Delete ${d.code}`}><Trash2 className="size-3.5" /></button>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
      {editing && <DiscountModal discount={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => del.mutate(deleting)} loading={del.isPending} title={`Delete ${deleting?.code}?`} description="Past orders that used this code are not affected." confirmLabel="Delete code" />
    </>
  )
}
