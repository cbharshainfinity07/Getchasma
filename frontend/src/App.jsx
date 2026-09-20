import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AppNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CustomCursor from './components/layout/CustomCursor';
import BottomNav from './components/layout/BottomNav';
import SideCart from './components/cart/SideCart';
import TopBanner from './components/layout/TopBanner';

// Keep Home critical path eager for instantaneous LCP
import Home from './pages/Home';

// Lazy-load heavier storefront routes and visualizers
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const LensLabStudio = lazy(() => import('./components/product/LensLabStudio'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Membership = lazy(() => import('./pages/Membership'));
const CustomerLogin = lazy(() => import('./pages/account/Login'));
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'));

// Customer & Admin Authentication
import { UserAuthProvider } from './context/UserAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Lazy-load Admin Console modules
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

import { API_BASE_URL } from './config/api';

// Minimal, zero-layout-shift hairline loader
const AtelierLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-brand-offwhite">
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
      <div className="h-2 w-2 animate-ping bg-brand-black" />
      <span>Calibrating Atelier Viewport...</span>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isPDP = location.pathname.startsWith('/product/');

  // Backend connection check
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/status`)
      .then(res => res.json())
      .then(data => console.log(`Backend connected: ${data.message}`))
      .catch(() => console.warn('Backend not connected yet.'));
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isAdminPath) {
    return (
      <Suspense fallback={<AtelierLoader />}>
        <Routes>
          {/* Unprotected Admin Login Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-offwhite text-brand-black font-sans selection:bg-brand-black selection:text-brand-offwhite overflow-x-hidden">
      <CustomCursor />
      {location.pathname !== '/' && <TopBanner />}
      <AppNavbar />
      <SideCart />
      
      <main className={isPDP ? "pb-0" : "pb-20 md:pb-0"}>
        <Suspense fallback={<AtelierLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/account" element={<AccountDashboard />} />
            <Route path="/account/login" element={<CustomerLogin />} />
            <Route path="/lens-lab" element={<LensLabStudio />} />
            <Route path="/optical-lab" element={<LensLabStudio />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      {/* Suppress BottomNav entirely on PDP to grant full real estate to the Buy Bar */}
      {!isPDP && <BottomNav />}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Storefront Error Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="font-serif text-3xl font-bold text-white">GetChasma Luxury Eyewear</h2>
            <p className="text-sm text-gray-400">
              A temporary display error occurred while rendering this view.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-3 bg-brand-cream text-brand-black rounded-none font-mono font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors shadow-lg cursor-pointer"
            >
              Refresh Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <UserAuthProvider>
          <AppContent />
        </UserAuthProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}
