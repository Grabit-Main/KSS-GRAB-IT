import React, { useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import './styles/global.css';
import './styles/components.css';

import AuthGuard from '../components/AuthGuard';
import { forceScrollToTop } from '../utils/scrollToTop';

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
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesOverviewPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/festival/:festivalId" element={<FestivalPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <CheckoutPage />
            </AuthGuard>
          }
        />
        <Route
          path="/orders"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrdersPage />
            </AuthGuard>
          }
        />
        <Route
          path="/orders/track/:orderId"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrderTrackingPage />
            </AuthGuard>
          }
        />
        <Route
          path="/order-tracking/:orderId"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <OrderTrackingPage />
            </AuthGuard>
          }
        />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route
          path="/profile"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/wishlist"
          element={
            <AuthGuard allowedRoles={['customer', 'admin']}>
              <WishlistPage />
            </AuthGuard>
          }
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:tab" element={<HelpPage />} />
      </Routes>
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
