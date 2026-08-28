import React, { lazy, Suspense, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingCartBar from './components/common/FloatingCartBar';
import './styles/global.css';
import './styles/components.css';

import AuthGuard from '../components/AuthGuard';
import { forceScrollToTop } from '../utils/scrollToTop';

// ── Lazy-load all heavy pages — each becomes its own JS chunk
// This ensures the home page renders immediately without waiting for
// CategoryPage (52KB), CheckoutPage (52KB), ProductDetailPage (48KB), etc.
const HomePage               = lazy(() => import('./pages/HomePage'));
const CategoryPage           = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage      = lazy(() => import('./pages/ProductDetailPage'));
const CartPage               = lazy(() => import('./pages/CartPage'));
const CheckoutPage           = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage             = lazy(() => import('./pages/OrdersPage'));
const OrderTrackingPage      = lazy(() => import('./pages/OrderTrackingPage'));
const SearchResultsPage      = lazy(() => import('./pages/SearchResultsPage'));
const ProfilePage            = lazy(() => import('./pages/ProfilePage'));
const HelpPage               = lazy(() => import('./pages/HelpPage'));
const CategoriesOverviewPage = lazy(() => import('./pages/CategoriesOverviewPage'));
const WishlistPage           = lazy(() => import('./pages/WishlistPage'));
const FestivalPage           = lazy(() => import('./pages/FestivalPage'));

// ── Lightweight skeleton shown while a lazy page chunk is loading
function PageSkeleton() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: '#F8FAFC',
    }}>
      {/* Animated shimmer bar */}
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '4px solid #E2E8F0',
        borderTop: '4px solid #0071E3',
        animation: 'grabit-spin 0.7s linear infinite',
      }} />
      <style>{`
        @keyframes grabit-spin { to { transform: rotate(360deg); } }
      `}</style>
      <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>Loading…</span>
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useLayoutEffect(() => {
    forceScrollToTop();
  }, [location.pathname, location.search, location.hash]);
  return null;
}

function CustomerAnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-route-transition">
      {/* Suspense boundary: shows PageSkeleton while the lazy chunk loads */}
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/"                      element={<HomePage />} />
          <Route path="/categories"            element={<CategoriesOverviewPage />} />
          <Route path="/category/:slug"        element={<CategoryPage />} />
          <Route path="/product/:id"           element={<ProductDetailPage />} />
          <Route path="/festival/:festivalId"  element={<FestivalPage />} />
          <Route path="/cart"                  element={<CartPage />} />
          <Route path="/search"                element={<SearchResultsPage />} />
          <Route path="/help"                  element={<HelpPage />} />
          <Route path="/help/:tab"             element={<HelpPage />} />

          {/* Auth-gated routes */}
          <Route path="/checkout" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <CheckoutPage />
            </AuthGuard>
          } />
          <Route path="/orders" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrdersPage />
            </AuthGuard>
          } />
          <Route path="/orders/track/:orderId" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrderTrackingPage />
            </AuthGuard>
          } />
          <Route path="/order-tracking/:orderId" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrderTrackingPage />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <ProfilePage />
            </AuthGuard>
          } />
          <Route path="/wishlist" element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <WishlistPage />
            </AuthGuard>
          } />
        </Routes>
      </Suspense>
    </div>
  );
}

export function CustomerPortalApp() {
  return (
    <ToastProvider>
      <LocationProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="page-wrapper">
              <Header />
              <main className="page-content">
                <CustomerAnimatedRoutes />
              </main>
              <FloatingCartBar />
              <Footer />
            </div>
          </CartProvider>
        </WishlistProvider>
      </LocationProvider>
    </ToastProvider>
  );
}

export default CustomerPortalApp;
