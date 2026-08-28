import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingCartBar from './components/common/FloatingCartBar';
import './styles/global.css';
import './styles/components.css';

import { forceScrollToTop } from './utils/scrollToTop';

// ── Lazy-load all pages — each becomes its own JS chunk ──
// Customer pages
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
const LoginPage              = lazy(() => import('./pages/LoginPage'));

// Portal apps — only loaded when their URL prefix is visited
const SellerPortalApp   = lazy(() => import('./seller/SellerPortalApp'));
const DeliveryPortalApp = lazy(() => import('./delivery/DeliveryPortalApp'));
const AdminPortalApp    = lazy(() => import('./admin/AdminPortalApp'));

// ── Minimal loading state ──
function PageSkeleton() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '12px',
      background: '#F8FAFC',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '4px solid #E2E8F0', borderTop: '4px solid #0071E3',
        animation: 'gabspin 0.7s linear infinite',
      }} />
      <style>{`@keyframes gabspin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600 }}>Loading…</span>
    </div>
  );
}

// Portal-level skeleton (full viewport)
function PortalSkeleton() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '14px', background: '#F8FAFC',
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: 'linear-gradient(135deg, #0071E3, #005BB5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '22px', fontWeight: 900,
      }}>G</div>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Opening GrabIt…</div>
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

function InitialLoginCheck() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('grabit_session');
    const userStr = localStorage.getItem('grabit_user');
    const path = location.pathname;

    const isProtected =
      path === '/checkout' ||
      path === '/orders' ||
      path.startsWith('/orders/track') ||
      path.startsWith('/order-tracking') ||
      path === '/profile' ||
      path === '/wishlist';

    if (isProtected && (!session || !userStr)) {
      sessionStorage.setItem('grabit_intended_path', path);
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const isPortalOrAuth =
    location.pathname === '/login' ||
    location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/admin');

  const routes = (
    <Suspense fallback={isPortalOrAuth ? <PortalSkeleton /> : <PageSkeleton />}>
      <Routes location={location}>
        {/* Customer Portal Routes */}
        <Route path="/"                          element={<HomePage />} />
        <Route path="/categories"                element={<CategoriesOverviewPage />} />
        <Route path="/category/:slug"            element={<CategoryPage />} />
        <Route path="/product/:id"               element={<ProductDetailPage />} />
        <Route path="/festival/:festivalId"      element={<FestivalPage />} />
        <Route path="/cart"                      element={<CartPage />} />
        <Route path="/checkout"                  element={<CheckoutPage />} />
        <Route path="/orders"                    element={<OrdersPage />} />
        <Route path="/orders/track/:orderId"     element={<OrderTrackingPage />} />
        <Route path="/order-tracking/:orderId"   element={<OrderTrackingPage />} />
        <Route path="/search"                    element={<SearchResultsPage />} />
        <Route path="/profile"                   element={<ProfilePage />} />
        <Route path="/wishlist"                  element={<WishlistPage />} />
        <Route path="/help"                      element={<HelpPage />} />
        <Route path="/help/:tab"                 element={<HelpPage />} />

        {/* Auth */}
        <Route path="/login"                     element={<LoginPage />} />

        {/* Portals — only loaded when their prefix is visited */}
        <Route path="/seller/*"                  element={<SellerPortalApp />} />
        <Route path="/delivery/*"                element={<DeliveryPortalApp />} />
        <Route path="/admin/*"                   element={<AdminPortalApp />} />
      </Routes>
    </Suspense>
  );

  if (isPortalOrAuth) return routes;

  return (
    <div key={location.pathname} className="page-route-transition">
      {routes}
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isPortalOrAuth =
    location.pathname === '/login' ||
    location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/delivery') ||
    location.pathname.startsWith('/admin');

  if (isPortalOrAuth) return <AnimatedRoutes />;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-content">
        <AnimatedRoutes />
      </main>
      <FloatingCartBar />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <InitialLoginCheck />
      <ToastProvider>
        <LocationProvider>
          <WishlistProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </LocationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
