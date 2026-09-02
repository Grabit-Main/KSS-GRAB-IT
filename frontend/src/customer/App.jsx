import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
import NotificationsPage from './pages/NotificationsPage';
import FestivalPage from './pages/FestivalPage';
import FreshProducePage from '../pages/FreshProducePage';
import PharmacyPage from '../pages/PharmacyPage';
import ChickenMeatPage from '../pages/ChickenMeatPage';
import DiwaliBannerPage from '../pages/DiwaliBannerPage';
import ExclusiveDealsPage from '../pages/ExclusiveDealsPage';
import FloatingCartBar from './components/common/FloatingCartBar';
import DeliveryRiderAnimation from './components/common/DeliveryRiderAnimation';
import MobileBottomNav from './components/common/MobileBottomNav';
import './styles/global.css';
import './styles/components.css';

import { forceScrollToTop } from '../utils/scrollToTop';

// Automatically scroll to top synchronously BEFORE paint on route change
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
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesOverviewPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/festival/:festivalId" element={<FestivalPage />} />
        <Route path="/fresh-produce" element={<FreshProducePage />} />
        <Route path="/pharmacy" element={<PharmacyPage />} />
        <Route path="/chicken-meat" element={<ChickenMeatPage />} />
        <Route path="/diwali-banner" element={<DiwaliBannerPage />} />
        <Route path="/exclusive-deals" element={<ExclusiveDealsPage />} />
        <Route path="/deals" element={<ExclusiveDealsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:tab" element={<HelpPage />} />
      </Routes>
    </div>
  );
}

function CategoryHeader({ title }) {
  const navigate = useNavigate();

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '64px',
        zIndex: 99999,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            aria-label="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
        </div>
      </header>
      <div style={{ height: '64px', flexShrink: 0 }} />
    </>
  );
}

function AppContent() {
  const location = useLocation();

  const categoryTitles = {
    '/categories': 'All Categories',
    '/fresh-produce': 'Fresh Vegetables & Fruits',
    '/pharmacy': 'Pharmacy at your Doorstep',
    '/chicken-meat': 'Fresh Chicken & Meat',
    '/diwali-banner': 'Festival Special Offers',
    '/exclusive-deals': 'Exclusive Deals & Offers',
    '/deals': 'Exclusive Deals & Offers'
  };

  const slugTitleMap = {
    'snacks-munchies': 'Snacks & Munchies',
    'beverages': 'Cold Drinks & Juices',
    'dairy-bakery': 'Dairy & Bakery',
    'produce': 'Fresh Fruits & Vegetables',
    'groceries': 'Grocery & Staples',
    'staples': 'Atta, Rice & Dal',
    'personal-care': 'Personal Care',
    'household': 'Household Essentials',
    'chocolates': 'Chocolates & Sweets',
    'electronics': 'Electronics & Gadgets',
    'meat': 'Fresh Meat & Seafood',
    'meat-seafood': 'Fresh Meat & Seafood',
    'pharmacy': 'Pharmacy & Health',
    'health-wellness': 'Health & Wellness',
    'baby-care': 'Baby Care',
    'pet-care': 'Pet Care & Food',
    'beauty-cosmetics': 'Beauty & Cosmetics',
    'fashion': 'Fashion & Accessories',
    'instant-food': 'Instant & Frozen Food',
    'biscuits': 'Biscuits & Cookies',
    'oil': 'Edible Oils & Ghee',
    'tea-coffee': 'Tea, Coffee & Drinks',
    'home-kitchen': 'Home & Kitchen',
    'stationery-office': 'Stationery & Office',
    'sports-fitness': 'Sports & Fitness',
    'toys-games': 'Toys & Games',
    'pooja-needs': 'Pooja & Spiritual Needs'
  };

  let currentCategoryTitle = categoryTitles[location.pathname];
  if (!currentCategoryTitle && location.pathname.startsWith('/category/')) {
    const rawSlug = decodeURIComponent(location.pathname.replace('/category/', '')).trim();
    const slug = rawSlug.toLowerCase();
    currentCategoryTitle = slugTitleMap[slug] || rawSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return (
    <div className="page-wrapper">
      {currentCategoryTitle ? (
        <CategoryHeader title={currentCategoryTitle} />
      ) : (
        <Header />
      )}
      <main className="page-content">
        <AnimatedRoutes />
      </main>
      <FloatingCartBar />
      <DeliveryRiderAnimation />
      <MobileBottomNav />
      <Footer />
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
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </LocationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
