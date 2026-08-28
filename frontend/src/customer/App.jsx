import { lazy, Suspense, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingCartBar from './components/common/FloatingCartBar';
import './styles/global.css';
import './styles/components.css';

import { forceScrollToTop } from '../utils/scrollToTop';

// ── Lazy-load all pages for code splitting
const HomePage               = lazy(() => import('./pages/HomePage'));
const CategoryPage           = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage      = lazy(() => import('./pages/ProductDetailPage'));
const CartPage               = lazy(() => import('./pages/CartPage'));
const CheckoutPage           = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage             = lazy(() => import('./pages/OrdersPage'));
const SearchResultsPage      = lazy(() => import('./pages/SearchResultsPage'));
const ProfilePage            = lazy(() => import('./pages/ProfilePage'));
const HelpPage               = lazy(() => import('./pages/HelpPage'));
const CategoriesOverviewPage = lazy(() => import('./pages/CategoriesOverviewPage'));
const WishlistPage           = lazy(() => import('./pages/WishlistPage'));
const FestivalPage           = lazy(() => import('./pages/FestivalPage'));

function PageSkeleton() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', background: '#F8FAFC' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #E2E8F0', borderTop: '4px solid #0071E3', animation: 'gspin 0.7s linear infinite' }} />
      <style>{`@keyframes gspin { to { transform: rotate(360deg); } }`}</style>
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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-route-transition">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/"                      element={<HomePage />} />
          <Route path="/categories"            element={<CategoriesOverviewPage />} />
          <Route path="/category/:slug"        element={<CategoryPage />} />
          <Route path="/product/:id"           element={<ProductDetailPage />} />
          <Route path="/festival/:festivalId"  element={<FestivalPage />} />
          <Route path="/cart"                  element={<CartPage />} />
          <Route path="/checkout"              element={<CheckoutPage />} />
          <Route path="/orders"                element={<OrdersPage />} />
          <Route path="/search"                element={<SearchResultsPage />} />
          <Route path="/profile"               element={<ProfilePage />} />
          <Route path="/wishlist"              element={<WishlistPage />} />
          <Route path="/help"                  element={<HelpPage />} />
          <Route path="/help/:tab"             element={<HelpPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <LocationProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="page-wrapper">
                <Header />
                <main className="page-content">
                  <AnimatedRoutes />
                </main>
                <FloatingCartBar />
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </LocationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
