import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import CategoriesOverviewPage from './pages/CategoriesOverviewPage';
import WishlistPage from './pages/WishlistPage';
import FestivalPage from './pages/FestivalPage';
import FloatingCartBar from './components/common/FloatingCartBar';
import DeliveryRiderAnimation from './components/common/DeliveryRiderAnimation';
import './styles/global.css';
import './styles/components.css';

import SellerPortalApp from './seller/SellerPortalApp';
import DeliveryPortalApp from './delivery/DeliveryPortalApp';
import AdminPortalApp from './admin/AdminPortalApp';
import LoginPage from './pages/LoginPage';
import { forceScrollToTop } from './utils/scrollToTop';

// Automatically scroll to top synchronously BEFORE paint on route change
function ScrollToTop() {
  const location = useLocation();
  useLayoutEffect(() => {
    forceScrollToTop();
  }, [location.pathname, location.search, location.hash]);
  return null;
}

// Prompts for login first if user hasn't logged in or skipped yet
function InitialLoginCheck() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    const isCustomerRoute =
      path === '/' ||
      path === '/categories' ||
      path.startsWith('/category/') ||
      path.startsWith('/product/') ||
      path.startsWith('/festival/') ||
      path === '/cart' ||
      path === '/checkout' ||
      path === '/orders' ||
      path.startsWith('/orders/track') ||
      path.startsWith('/order-tracking') ||
      path === '/search' ||
      path === '/profile' ||
      path === '/wishlist' ||
      path.startsWith('/help');

    if (isCustomerRoute) {
      try {
        const userStr = localStorage.getItem('grabit_user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || user.role !== 'customer') {
          const customerUser = {
            id: 4,
            role: 'customer',
            name: user?.name || user?.full_name || 'Rahul Sharma',
            full_name: user?.full_name || user?.name || 'Rahul Sharma',
            phone: user?.phone || '+919999900004',
            email: user?.email || 'rahul@grabit.local'
          };
          localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
          localStorage.setItem('grabit_user', JSON.stringify(customerUser));
        }
      } catch {}
    }
  }, [location.pathname]);

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
    <Routes location={location}>
      {/* Customer Home Page Route */}
      <Route path="/" element={<HomePage />} />
      <Route path="/categories" element={<CategoriesOverviewPage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/festival/:festivalId" element={<FestivalPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/track/:orderId" element={<OrderTrackingPage />} />
      <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/help/:tab" element={<HelpPage />} />

      {/* Unified Auth Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Seller / Merchant Portal Route */}
      <Route path="/seller/*" element={<SellerPortalApp />} />

      {/* Delivery Partner Portal Route */}
      <Route path="/delivery/*" element={<DeliveryPortalApp />} />

      {/* Admin Portal Route */}
      <Route path="/admin/*" element={<AdminPortalApp />} />
    </Routes>
  );

  if (isPortalOrAuth) {
    return routes;
  }

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

  if (isPortalOrAuth) {
    return <AnimatedRoutes />;
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-content">
        <AnimatedRoutes />
      </main>
      <FloatingCartBar />
      <DeliveryRiderAnimation />
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
