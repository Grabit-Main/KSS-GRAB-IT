import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import CategoriesOverviewPage from './pages/CategoriesOverviewPage';
import WishlistPage from './pages/WishlistPage';
import FestivalPage from './pages/FestivalPage';
import FloatingCartBar from './components/common/FloatingCartBar';
import './styles/global.css';
import './styles/components.css';

import SellerPortalApp from './seller/SellerPortalApp';
import DeliveryPortalApp from './delivery/DeliveryPortalApp';

// Automatically scroll to top synchronously BEFORE paint on route change
function ScrollToTop() {
  const location = useLocation();
  useLayoutEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-route-transition">
      <Routes location={location}>
        {/* Customer Portal Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesOverviewPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/festival/:festivalId" element={<FestivalPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:tab" element={<HelpPage />} />

        {/* Seller / Merchant Portal Route */}
        <Route path="/seller/*" element={<SellerPortalApp />} />

        {/* Delivery Partner Portal Route */}
        <Route path="/delivery/*" element={<DeliveryPortalApp />} />
      </Routes>
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
