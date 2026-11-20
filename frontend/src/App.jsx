import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import AppNavbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import SideCart from './components/cart/SideCart'
import { PageLoader } from './components/ui/Feedback'
import Home from './pages/Home'

// Route-level code splitting keeps the storefront entry small.
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderPages').then((m) => ({ default: m.OrderConfirmation })))
const TrackOrder = lazy(() => import('./pages/OrderPages').then((m) => ({ default: m.TrackOrder })))
const AuthPage = lazy(() => import('./pages/Account').then((m) => ({ default: m.AuthPage })))
const AccountHome = lazy(() => import('./pages/Account').then((m) => ({ default: m.AccountHome })))
const AccountOrder = lazy(() => import('./pages/Account').then((m) => ({ default: m.AccountOrder })))
const Wishlist = lazy(() => import('./pages/Misc').then((m) => ({ default: m.Wishlist })))
const InfoPage = lazy(() => import('./pages/Misc').then((m) => ({ default: m.InfoPage })))
const NotFound = lazy(() => import('./pages/Misc').then((m) => ({ default: m.NotFound })))

// The admin dashboard is a separate bundle, never downloaded by shoppers.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function StorefrontLayout() {
  return (
    <div className="min-h-[100dvh] bg-white font-sans text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <AppNavbar />
      <SideCart />
      <main id="main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<StorefrontLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:category" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:orderNumber" element={<OrderConfirmation />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<AccountHome />} />
          <Route path="account/login" element={<AuthPage />} />
          <Route path="account/orders/:orderNumber" element={<AccountOrder />} />
          <Route path="help/:slug" element={<InfoPage />} />
          <Route path="search" element={<Shop />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
