import { lazy, Suspense, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  FolderTree,
  TicketPercent,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { api } from '../lib/api'
import { cn } from '../lib/format'
import { Field, Input } from '../components/ui/Field'
import { PageLoader } from '../components/ui/Feedback'
import Button from '../components/ui/Button'
import { AdminContext, useAdmin } from './context'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductForm = lazy(() => import('./pages/ProductForm'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Inventory = lazy(() => import('./pages/Inventory'))
const Customers = lazy(() => import('./pages/Customers'))
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'))
const Categories = lazy(() => import('./pages/Categories'))
const Discounts = lazy(() => import('./pages/Discounts'))
const Analytics = lazy(() => import('./pages/Analytics'))
const SettingsPage = lazy(() => import('./pages/Settings'))

const NAV = [
  { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }] },
  {
    group: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: 'pendingOrders' },
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/discounts', label: 'Discounts', icon: TicketPercent },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes, badge: 'lowStock', badgeTone: 'warning' },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    ],
  },
  { group: 'Store', items: [{ to: '/admin/settings', label: 'Settings', icon: Settings }] },
]

function Login() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const login = useMutation({
    mutationFn: (b) => api.post('/admin/auth/login', b),
    onSuccess: (d) => qc.setQueryData(['admin', 'me'], d),
  })
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-[44%] overflow-hidden bg-black lg:block">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/50 blur-[140px]" />
        <img src="/3d-glasses.png" alt="" className="absolute left-1/2 top-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-lighten" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <img src="/logo.webp" alt="GetChasma" className="h-10" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">Store administration — products, orders, inventory and analytics in one place.</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault()
            login.mutate(form)
          }}
          className="w-full max-w-sm"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-ink text-white">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in to admin</h1>
          <p className="mt-1.5 text-sm text-muted">Authorised staff only.</p>
          <div className="mt-8 space-y-4">
            <Field label="Email" error={login.error?.fields?.email}>
              {(p) => <Input {...p} type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}
            </Field>
            <Field label="Password" error={login.error?.fields?.password}>
              {(p) => <Input {...p} type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
            </Field>
            {login.isError && !Object.keys(login.error.fields).length && (
              <p className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">{login.error.message}</p>
            )}
            <Button type="submit" full loading={login.isPending}>Sign in</Button>
          </div>
          <Link to="/" className="mt-8 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
            ← Back to storefront
          </Link>
        </motion.form>
      </div>
    </div>
  )
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAdmin()
  const { data: badges } = useQuery({ queryKey: ['admin', 'badges'], queryFn: () => api.get('/admin/badges'), refetchInterval: 60_000 })
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <img src="/logo.webp" alt="GetChasma" className="h-8 invert" />
        <span className="rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Admin</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon, end, badge, badgeTone }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                        isActive ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink',
                      )
                    }
                  >
                    <Icon className="size-4" strokeWidth={1.8} />
                    <span className="flex-1">{label}</span>
                    {badge && badges?.[badge] > 0 && (
                      <span className={cn('min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold', badgeTone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-ink text-white')}>
                        {badges[badge]}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{user.name.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted">{user.role}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Shell({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  return (
    <div className="admin-scope min-h-screen bg-paper/60 font-sans text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line bg-white lg:block">
        <Sidebar />
      </aside>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute inset-y-0 left-0 w-64 bg-white">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 hover:bg-paper" aria-label="Close menu">
                <X className="size-4" />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button className="rounded-lg p-2 hover:bg-paper lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden text-sm text-muted lg:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" to="/admin/products/new">+ New product</Button>
            <Button variant="ghost" size="sm" href="/" target="_blank" rel="noreferrer">
              View store <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </header>
        <main key={location.pathname} className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const me = useQuery({ queryKey: ['admin', 'me'], queryFn: () => api.get('/admin/auth/me'), retry: false, staleTime: 5 * 60_000 })
  const logout = useMutation({
    mutationFn: () => api.post('/admin/auth/logout'),
    onSettled: () => {
      qc.removeQueries({ queryKey: ['admin'] })
      qc.setQueryData(['admin', 'me'], null)
      navigate('/admin')
    },
  })

  if (me.isLoading) return <PageLoader />
  const user = me.data?.user
  if (!user) return <Login />

  return (
    <AdminContext.Provider value={{ user, isAdmin: user.role === 'admin', logout: () => logout.mutate() }}>
      <Shell>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Shell>
    </AdminContext.Provider>
  )
}
