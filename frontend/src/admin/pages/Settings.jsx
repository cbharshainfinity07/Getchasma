import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Store, Palette, Truck, Receipt, CreditCard, MessageSquareQuote, UsersRound, KeyRound, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { cn, formatDateTime, timeAgo } from '../../lib/format'
import { Field, Input, Select, Switch, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Overlay'
import { ErrorState, PageLoader, Alert, Badge } from '../../components/ui/Feedback'
import Button from '../../components/ui/Button'
import { Card, PageHeader, ImageUploader, Table, Th, Td } from '../ui'
import { useAdmin } from '../context'

const TABS = [
  { key: 'store', label: 'Store details', icon: Store },
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'tax', label: 'Tax', icon: Receipt },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { key: 'team', label: 'Team', icon: UsersRound, adminOnly: true },
  { key: 'account', label: 'My password', icon: KeyRound },
]

/** Generic section form: local state, PUT on save, inline field errors from the API. */
function useSection(section, data) {
  const qc = useQueryClient()
  const [values, setValues] = useState(data)
  useEffect(() => setValues(data), [data])
  const m = useMutation({
    mutationFn: (v) => api.put(`/admin/settings/${section}`, v),
    onSuccess: () => {
      toast.success('Settings saved')
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (e) => toast.error(e.message),
  })
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e?.target ? e.target.value : e }))
  const err = (k) => m.error?.fields?.[k]
  const dirty = JSON.stringify(values) !== JSON.stringify(data)
  return { values, setValues, set, err, save: () => m.mutate(values), reset: () => setValues(data), saving: m.isPending, dirty }
}

function SaveBar({ s }) {
  return (
    <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
      <Button variant="secondary" size="sm" disabled={!s.dirty} onClick={s.reset}>
        Reset
      </Button>
      <Button size="sm" loading={s.saving} disabled={!s.dirty} onClick={s.save}>Save changes</Button>
    </div>
  )
}

function StoreForm({ data, readOnly }) {
  const s = useSection('store', data)
  const v = s.values
  if (!v) return null
  return (
    <Card title="Store details" description="Shown in the footer, help pages, emails and checkout.">
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name" error={s.err('name')}>{(p) => <Input {...p} value={v.name} onChange={s.set('name')} />}</Field>
        <Field label="Tagline" error={s.err('tagline')}>{(p) => <Input {...p} value={v.tagline || ''} onChange={s.set('tagline')} />}</Field>
        <Field label="Support email" error={s.err('email')}>{(p) => <Input {...p} type="email" value={v.email} onChange={s.set('email')} />}</Field>
        <Field label="Phone" error={s.err('phone')}>{(p) => <Input {...p} value={v.phone} onChange={s.set('phone')} />}</Field>
        <Field label="WhatsApp number" hint="Digits with country code" error={s.err('whatsapp')}>{(p) => <Input {...p} value={v.whatsapp || ''} onChange={s.set('whatsapp')} placeholder="919740310101" />}</Field>
        <Field label="Currency">{(p) => <Input {...p} value="INR (₹)" disabled />}</Field>
        <Field label="Address" error={s.err('address')} className="sm:col-span-2">{(p) => <Textarea {...p} rows={2} value={v.address} onChange={s.set('address')} />}</Field>
        <Field label="Instagram URL" error={s.err('instagram')}>{(p) => <Input {...p} value={v.instagram || ''} onChange={s.set('instagram')} />}</Field>
        <Field label="Facebook URL" error={s.err('facebook')}>{(p) => <Input {...p} value={v.facebook || ''} onChange={s.set('facebook')} />}</Field>
        <Field label="Announcement bar" hint="Leave blank to hide" error={s.err('announcement')} className="sm:col-span-2">
          {(p) => <Input {...p} value={v.announcement || ''} onChange={s.set('announcement')} />}
        </Field>
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function BrandingForm({ data, readOnly }) {
  const s = useSection('branding', data)
  const v = s.values
  if (!v) return null
  return (
    <Card title="Branding" description="Logo and the approved hero copy on the homepage.">
      <fieldset disabled={readOnly} className="space-y-4">
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Logo <span className="font-normal text-muted">(white on transparent — inverted automatically on light backgrounds)</span></p>
          <div className="max-w-xs rounded-xl bg-ink p-4">
            <ImageUploader single value={v.logo ? [{ url: v.logo }] : []} onChange={(imgs) => s.setValues({ ...v, logo: imgs[0]?.url || '/logo.webp' })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hero eyebrow" error={s.err('heroEyebrow')}>{(p) => <Input {...p} value={v.heroEyebrow} onChange={s.set('heroEyebrow')} />}</Field>
          <Field label="Accent colour" error={s.err('accentColor')}>
            {(p) => (
              <div className="flex gap-2">
                <input type="color" value={v.accentColor} onChange={s.set('accentColor')} className="h-11 w-14 cursor-pointer rounded-xl border border-line-strong" aria-label="Pick accent colour" />
                <Input {...p} value={v.accentColor} onChange={s.set('accentColor')} className="font-mono" />
              </div>
            )}
          </Field>
          <Field label="Hero headline" error={s.err('heroTitle')} help="The last two words are set in the italic accent face." className="sm:col-span-2">
            {(p) => <Input {...p} value={v.heroTitle} onChange={s.set('heroTitle')} />}
          </Field>
        </div>
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function ShippingForm({ data, readOnly }) {
  const s = useSection('shipping', data)
  const v = s.values
  if (!v) return null
  return (
    <Card title="Shipping" description="Applied to every checkout quote on the server.">
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
        <Field label="Flat shipping rate" error={s.err('flatRate')}>{(p) => <Input {...p} type="number" min="0" prefix="₹" value={v.flatRate} onChange={(e) => s.setValues({ ...v, flatRate: Number(e.target.value) })} />}</Field>
        <Field label="Free shipping above" hint="0 = never free" error={s.err('freeThreshold')}>{(p) => <Input {...p} type="number" min="0" prefix="₹" value={v.freeThreshold} onChange={(e) => s.setValues({ ...v, freeThreshold: Number(e.target.value) })} />}</Field>
        <Field label="Estimated delivery" error={s.err('estimatedDelivery')}>{(p) => <Input {...p} value={v.estimatedDelivery} onChange={s.set('estimatedDelivery')} />}</Field>
        <Field label="Ships to" error={s.err('shipsTo')}>{(p) => <Input {...p} value={v.shipsTo} onChange={s.set('shipsTo')} />}</Field>
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function TaxForm({ data, readOnly }) {
  const s = useSection('tax', data)
  const v = s.values
  if (!v) return null
  return (
    <Card title="Tax" description="Inclusive pricing is the norm in India (MRP includes GST).">
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2">
        <Field label="Tax label" error={s.err('label')}>{(p) => <Input {...p} value={v.label} onChange={s.set('label')} />}</Field>
        <Field label="Rate" error={s.err('rate')}>{(p) => <Input {...p} type="number" min="0" max="50" step="0.01" suffix="%" value={v.rate} onChange={(e) => s.setValues({ ...v, rate: Number(e.target.value) })} />}</Field>
        <Switch className="sm:col-span-2" checked={v.inclusive} onChange={(x) => s.setValues({ ...v, inclusive: x })} label="Prices include tax" description="When off, tax is added on top of the order total at checkout" />
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function PaymentsForm({ data, integrations, readOnly }) {
  const s = useSection('payments', data)
  const v = s.values
  if (!v) return null
  return (
    <Card title="Payments">
      <fieldset disabled={readOnly} className="space-y-5">
        <div className="rounded-xl border border-line p-4">
          <Switch checked={v.codEnabled} onChange={(x) => s.setValues({ ...v, codEnabled: x })} label="Cash on delivery" description="Customers pay when the order arrives" />
          {v.codEnabled && (
            <Field label="Maximum order value for COD" hint="0 = no limit" className="mt-4 max-w-xs">
              {(p) => <Input {...p} type="number" min="0" prefix="₹" value={v.codMaxOrder} onChange={(e) => s.setValues({ ...v, codMaxOrder: Number(e.target.value) })} />}
            </Field>
          )}
        </div>
        <div className="rounded-xl border border-line p-4">
          <Switch checked={v.razorpayEnabled} onChange={(x) => s.setValues({ ...v, razorpayEnabled: x })} label="Online payments (Razorpay)" description="UPI, cards, net banking and wallets" />
          <div className="mt-4 flex items-center gap-2 text-sm">
            {integrations.razorpayConfigured ? (
              <>
                <CheckCircle2 className="size-4 text-success" /> API keys configured <span className="font-mono text-xs text-muted">{integrations.razorpayKeyId}</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-warning" /> Not configured
              </>
            )}
          </div>
          {!integrations.razorpayConfigured && (
            <Alert tone="info" className="mt-3">
              Add <code className="font-mono">RAZORPAY_KEY_ID</code> and <code className="font-mono">RAZORPAY_KEY_SECRET</code> to <code className="font-mono">backend/.env</code> and restart the API.
              Until then, online payment is shown to shoppers as unavailable.
            </Alert>
          )}
        </div>
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function TestimonialsForm({ data, readOnly }) {
  const s = useSection('testimonials', data)
  const list = s.values || []
  const update = (i, k, val) => s.setValues(list.map((t, j) => (j === i ? { ...t, [k]: val } : t)))
  return (
    <Card title="Testimonials" description="Shown on the homepage. Only publish genuine customer reviews.">
      <fieldset disabled={readOnly} className="space-y-4">
        {list.length === 0 && <p className="text-sm text-muted">No testimonials — the homepage section is hidden.</p>}
        {list.map((t, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-4">
            <Field label="Name" error={s.err(`${i}.name`)}>{(p) => <Input {...p} value={t.name} onChange={(e) => update(i, 'name', e.target.value)} />}</Field>
            <Field label="City">{(p) => <Input {...p} value={t.location || ''} onChange={(e) => update(i, 'location', e.target.value)} />}</Field>
            <Field label="Product">{(p) => <Input {...p} value={t.product || ''} onChange={(e) => update(i, 'product', e.target.value)} />}</Field>
            <Field label="Rating">
              {(p) => (
                <Select {...p} value={t.rating} onChange={(e) => update(i, 'rating', Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
                </Select>
              )}
            </Field>
            <Field label="Review" error={s.err(`${i}.quote`)} className="sm:col-span-4">
              {(p) => <Textarea {...p} rows={2} value={t.quote} onChange={(e) => update(i, 'quote', e.target.value)} />}
            </Field>
            <div className="sm:col-span-4">
              <Button variant="dangerGhost" size="xs" onClick={() => s.setValues(list.filter((_, j) => j !== i))}><Trash2 className="size-3" /> Remove</Button>
            </div>
          </div>
        ))}
        {list.length < 12 && (
          <Button variant="secondary" size="sm" onClick={() => s.setValues([...list, { name: '', location: '', quote: '', rating: 5, product: '' }])}>
            <Plus className="size-3.5" /> Add testimonial
          </Button>
        )}
      </fieldset>
      {!readOnly && <SaveBar s={s} />}
    </Card>
  )
}

function Team() {
  const qc = useQueryClient()
  const { user } = useAdmin()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', password: '' })
  const { data = [], isLoading } = useQuery({ queryKey: ['admin', 'team'], queryFn: () => api.get('/admin/team') })
  const create = useMutation({
    mutationFn: () => api.post('/admin/team', form),
    onSuccess: () => {
      toast.success('Team member added')
      setAdding(false)
      setForm({ name: '', email: '', role: 'staff', password: '' })
      qc.invalidateQueries({ queryKey: ['admin', 'team'] })
    },
  })
  const patch = useMutation({
    mutationFn: ({ id, ...b }) => api.patch(`/admin/team/${id}`, b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'team'] }),
    onError: (e) => toast.error(e.message),
  })
  const err = (k) => create.error?.fields?.[k]
  return (
    <Card
      title="Team"
      description="Admins have full access. Staff can manage products, orders and inventory but cannot change settings, delete records or issue refunds."
      padded={false}
      actions={<Button size="xs" onClick={() => setAdding(true)}><Plus className="size-3" /> Add member</Button>}
    >
      {isLoading ? (
        <PageLoader />
      ) : (
        <Table>
          <thead><tr><Th>Member</Th><Th>Role</Th><Th>Last sign-in</Th><Th>Access</Th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <Td>
                  <p className="font-medium">{u.name} {u.id === user.id && <span className="text-xs text-muted">(you)</span>}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </Td>
                <Td>
                  <Select value={u.role} disabled={u.id === user.id} onChange={(e) => patch.mutate({ id: u.id, role: e.target.value })} className="w-32" aria-label="Role">
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </Select>
                </Td>
                <Td className="text-muted" title={formatDateTime(u.lastLoginAt)}>{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</Td>
                <Td>
                  {u.id === user.id ? <Badge tone="success">Active</Badge> : <Switch checked={u.isActive} onChange={(v) => patch.mutate({ id: u.id, isActive: v })} />}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add team member"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" loading={create.isPending} onClick={() => create.mutate()}>Add member</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" error={err('name')}>{(p) => <Input {...p} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
          <Field label="Email" error={err('email')}>{(p) => <Input {...p} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}</Field>
          <Field label="Role">
            {(p) => (
              <Select {...p} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
            )}
          </Field>
          <Field label="Temporary password" help="At least 10 characters. Share it securely; they can change it after signing in." error={err('password')}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
          </Field>
        </div>
      </Modal>
    </Card>
  )
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const m = useMutation({
    mutationFn: () => api.put('/admin/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword }),
    onSuccess: () => {
      toast.success('Password updated')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    },
  })
  const mismatch = form.confirm && form.confirm !== form.newPassword
  return (
    <Card title="Change password" description="Use at least 10 characters.">
      <form
        className="max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!mismatch) m.mutate()
        }}
      >
        <Field label="Current password" error={m.error?.fields?.currentPassword}>{(p) => <Input {...p} type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />}</Field>
        <Field label="New password" error={m.error?.fields?.newPassword}>{(p) => <Input {...p} type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />}</Field>
        <Field label="Confirm new password" error={mismatch ? 'Passwords don’t match' : undefined}>{(p) => <Input {...p} type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />}</Field>
        {m.isError && !Object.keys(m.error.fields).length && <p className="text-sm text-danger">{m.error.message}</p>}
        <Button type="submit" size="sm" loading={m.isPending} disabled={!form.currentPassword || form.newPassword.length < 10 || mismatch}>Update password</Button>
      </form>
    </Card>
  )
}

export default function SettingsPage() {
  const { isAdmin } = useAdmin()
  const [tab, setTab] = useState('store')
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin', 'settings'], queryFn: () => api.get('/admin/settings') })
  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState error={error} onRetry={refetch} />
  const readOnly = !isAdmin
  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin)

  return (
    <>
      <PageHeader title="Settings" description="Store information, branding, shipping, tax, payments and team access." />
      {readOnly && !['account'].includes(tab) && (
        <Alert tone="info" className="mb-4">You have staff access — settings are read-only. Ask an admin to make changes.</Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col" aria-label="Settings sections">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn('flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition', tab === key ? 'bg-white text-ink shadow-card ring-1 ring-line' : 'text-muted hover:text-ink')}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </nav>
        <div className="min-w-0">
          {tab === 'store' && <StoreForm data={data.store} readOnly={readOnly} />}
          {tab === 'branding' && <BrandingForm data={data.branding} readOnly={readOnly} />}
          {tab === 'shipping' && <ShippingForm data={data.shipping} readOnly={readOnly} />}
          {tab === 'tax' && <TaxForm data={data.tax} readOnly={readOnly} />}
          {tab === 'payments' && <PaymentsForm data={data.payments} integrations={data.integrations} readOnly={readOnly} />}
          {tab === 'testimonials' && <TestimonialsForm data={data.testimonials} readOnly={readOnly} />}
          {tab === 'team' && isAdmin && <Team />}
          {tab === 'account' && <PasswordForm />}
        </div>
      </div>
    </>
  )
}
