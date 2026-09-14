import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Glasses, 
  ShoppingBag, 
  FolderTree, 
  ExternalLink, 
  Plus, 
  Bell, 
  Search, 
  Menu, 
  X,
  CheckCircle2,
  TrendingUp,
  LogOut,
  Tag
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminUser } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch pending orders count for badge
    fetch('http://localhost:5001/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.pendingOrders !== undefined) {
          setPendingCount(data.pendingOrders);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Glasses, label: 'Products', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders', badge: pendingCount > 0 ? pendingCount : null },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: Tag, label: 'Coupons & Promos', path: '/admin/coupons' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-gray-900 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0d0f12] text-white flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out border-r border-neutral-800/80
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold font-serif text-lg shadow-sm">
                G
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight block text-white leading-none">GetChasma</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Admin Pro</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Nav List */}
          <div className="px-4 py-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-3 block mb-3">
              Management
            </span>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} strokeWidth={isActive ? 2 : 1.75} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-black text-white' : 'bg-amber-400 text-black'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} />
              <span>Live Storefront</span>
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Preview ↗</span>
          </Link>

          <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                GC
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{adminUser?.name || 'Administrator'}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Top Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              <Menu size={18} />
            </button>
            <div>
              <h2 className="font-bold text-base md:text-lg text-gray-900">
                {location.pathname === '/admin' && 'Dashboard Overview'}
                {location.pathname === '/admin/products' && 'Eyewear Inventory & Products'}
                {location.pathname === '/admin/orders' && 'Customer Orders & Shipments'}
                {location.pathname === '/admin/categories' && 'Eyewear Collections'}
                {location.pathname === '/admin/coupons' && 'Promotional Coupons & Offer Broadcasting'}
              </h2>
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                GetChasma Production Management Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to Storefront */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-black rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <ExternalLink size={14} />
              <span>View Store</span>
            </Link>

            {/* Quick Action: New Product */}
            <Link
              to="/admin/products?action=new"
              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>Add Product</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Admin Mobile Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0d0f12]/95 backdrop-blur-md border-t border-neutral-800 z-40 pb-safe text-white">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 relative transition-colors ${
                  isActive ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/"
            target="_blank"
            className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-neutral-400 hover:text-white"
          >
            <ExternalLink size={18} />
            <span className="text-[10px] tracking-tight">Store ↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
