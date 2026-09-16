import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AppNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CustomCursor from './components/layout/CustomCursor';
import BottomNav from './components/layout/BottomNav';
import SideCart from './components/cart/SideCart';
import TopBanner from './components/layout/TopBanner';

// Storefront Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import Membership from './pages/Membership';
import CustomerLogin from './pages/account/Login';
import AccountDashboard from './pages/account/AccountDashboard';

// Customer & Admin Authentication
import { UserAuthProvider } from './context/UserAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';

// Admin Dashboard Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import { API_BASE_URL } from './config/api';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

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
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <CustomCursor />
      {location.pathname !== '/' && <TopBanner />}
      <AppNavbar />
      <SideCart />
      
      <main className="pb-20 md:pb-0">
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
        </Routes>
      </main>

      <Footer />
      <BottomNav />
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
              className="px-6 py-3 bg-amber-400 text-black rounded-full font-bold text-xs uppercase tracking-wider hover:bg-amber-500 transition-colors shadow-lg"
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
