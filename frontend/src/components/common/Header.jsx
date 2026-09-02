import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ChevronDown, ChevronRight, Search, User, ShoppingBag, ShoppingCart, Menu, X, LayoutGrid, Zap, Package, Heart, LogIn, Home, TrendingUp, Sparkles, ArrowRight, ArrowLeft, Store, Truck, ShieldCheck, Lightbulb, Bell, Flame, Wallet, CheckCheck, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useDeliveryLocation } from '../../context/LocationContext';
import { useWishlist } from '../../context/WishlistContext';
import AuthModal from './AuthModal';
import FestiveSubHeader from './FestiveSubHeader';
import ProductSvg from './ProductSvg';
import ProductSuggestionModal from './ProductSuggestionModal';
import useWindowWidth from '../../hooks/useWindowWidth';
import { searchProducts, getProductSlug } from '../../data/products';
import { getCanonicalSlug } from '../../data/categories';
import { getRealUserNotifications, markAllNotificationsAsRead, dismissNotification, markNotificationAsRead } from '../../utils/userNotifications';

const MEGA_CATEGORIES = [
  {
    title: 'Fresh Produce & Dairy',
    icon: '🍎',
    items: [
      { name: 'Fresh Fruits', link: '/category/produce', icon: '🍎' },
      { name: 'Fresh Vegetables', link: '/category/produce', icon: '🥦' },
      { name: 'Milk & Butter', link: '/category/dairy-bakery', icon: '🥛' },
      { name: 'Paneer & Cheese', link: '/category/dairy-bakery', icon: '🧀' },
      { name: 'Bread & Bakery', link: '/category/dairy-bakery', icon: '🍞' },
      { name: 'Fresh Meat & Seafood', link: '/category/meat-seafood', icon: '🥩' },
      { name: 'Farm Fresh Eggs', link: '/category/meat-seafood', icon: '🥚' },
    ]
  },
  {
    title: 'Snacks & Beverages',
    icon: '🍿',
    items: [
      { name: 'Potato Chips & Namkeens', link: '/category/snacks-munchies', icon: '🍿' },
      { name: 'Tortilla & Nachos', link: '/category/snacks-munchies', icon: '🥨' },
      { name: 'Cold Drinks & Soft Drinks', link: '/category/beverages', icon: '🥤' },
      { name: 'Fruit Juices & Drinks', link: '/category/beverages', icon: '🧃' },
      { name: 'Chocolates & Sweets', link: '/category/chocolates', icon: '🍫' },
      { name: 'Biscuits & Cookies', link: '/category/biscuits', icon: '🍪' },
    ]
  },
  {
    title: 'Staples & Kitchen Needs',
    icon: '🌾',
    items: [
      { name: 'Chakki Atta & Flours', link: '/category/staples', icon: '🌾' },
      { name: 'Basmati Rice & Grains', link: '/category/staples', icon: '🍚' },
      { name: 'Dals & Pulses', link: '/category/staples', icon: '🍲' },
      { name: 'Edible Oils & Ghee', link: '/category/oil', icon: '🛢️' },
      { name: 'Tea, Coffee & Drinks', link: '/category/tea-coffee', icon: '☕' },
      { name: 'Instant Noodles & Pasta', link: '/category/instant-food', icon: '🍜' },
    ]
  },
  {
    title: 'Care & Lifestyle',
    icon: '✨',
    items: [
      { name: 'Personal Care & Hygiene', link: '/category/personal-care', icon: '🧴' },
      { name: 'Baby Care & Diapers', link: '/category/baby-care', icon: '👶' },
      { name: 'Pet Care & Supplies', link: '/category/pet-care', icon: '🐾' },
      { name: 'Beauty & Cosmetics', link: '/category/beauty-cosmetics', icon: '💄' },
      { name: 'Health & Wellness', link: '/category/health-wellness', icon: '💊' },
      { name: 'Fashion & Accessories', link: '/category/fashion', icon: '🕶️' },
    ]
  },
  {
    title: 'Home, Fitness & Hobbies',
    icon: '🏠',
    items: [
      { name: 'Home & Kitchen Essentials', link: '/category/home-kitchen', icon: '🍳' },
      { name: 'Stationery & Office Supplies', link: '/category/stationery-office', icon: '📚' },
      { name: 'Sports & Fitness Gear', link: '/category/sports-fitness', icon: '🏸' },
      { name: 'Toys, Games & Puzzles', link: '/category/toys-games', icon: '🧩' },
      { name: 'Pooja & Spiritual Needs', link: '/category/pooja-needs', icon: '🪔' },
    ]
  }
];

const CATEGORY_HEADER_THEMES = {
  '/': {
    bg: '#FFFFFF',
    border: '#E2E8F0',
    accent: '#0071E3',
    placeholder: 'Search for milk, butter, chips, snacks...'
  },
  '/category/produce': {
    bg: '#EAF8F0',
    border: '#A7F3D0',
    accent: '#34C759',
    placeholder: 'Search fresh apples, tomatoes, bananas...'
  },
  '/category/dairy-bakery': {
    bg: '#EBF7FF',
    border: '#BAE6FD',
    accent: '#0284C7',
    placeholder: 'Search Amul butter, milk, paneer, bread...'
  },
  '/category/snacks-munchies': {
    bg: '#FFF6EB',
    border: '#FDBA74',
    accent: '#D97706',
    placeholder: 'Search Lay\'s, Doritos, Kurkure, snacks...'
  },
  '/category/beverages': {
    bg: '#FFEFEF',
    border: '#FECACA',
    accent: '#FF3B30',
    placeholder: 'Search Coca-Cola, Real juice, energy drinks...'
  },
  '/category/staples': {
    bg: '#F6FCEB',
    border: '#D9F99D',
    accent: '#65A30D',
    placeholder: 'Search Aashirvaad atta, basmati rice, dal...'
  },
  '/category/chocolates': {
    bg: '#FAF5FF',
    border: '#E9D5FF',
    accent: '#A855F7',
    placeholder: 'Search Dairy Milk, Ferrero Rocher, KitKat...'
  },
  '/category/personal-care': {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    accent: '#10B981',
    placeholder: 'Search Dettol, Dove, Colgate, shampoos...'
  },
  '/category/household': {
    bg: '#F0F9FF',
    border: '#BAE6FD',
    accent: '#0284C7',
    placeholder: 'Search Surf Excel, Vim gel, Harpic...'
  },
  '/category/biscuits': {
    bg: '#FFFBEB',
    border: '#FDE68A',
    accent: '#F59E0B',
    placeholder: 'Search Oreo, Parle-G, Good Day, Dark Fantasy...'
  },
  '/category/oil': {
    bg: '#FEFCE8',
    border: '#FEF08A',
    accent: '#EAB308',
    placeholder: 'Search Maggi noodles, pasta, frozen food...'
  },
  '/category/electronics': {
    bg: '#F5F0FF',
    border: '#DDD6FE',
    accent: '#8B5CF6',
    placeholder: 'Search headphones, gadgets, accessories...'
  },
  '/category/fashion': {
    bg: '#FFF0F2',
    border: '#FECDD3',
    accent: '#F43F5E',
    placeholder: 'Search sneakers, t-shirts, fashion gear...'
  },
  '/category/pharmacy': {
    bg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#7C3AED',
    placeholder: 'Search medicines, first aid, healthcare...'
  },
  '/pharmacy': {
    bg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#7C3AED',
    placeholder: 'Search medicines, pain relief, vitamins...'
  },
  '/category/health-wellness': {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    accent: '#10B981',
    placeholder: 'Search vitamins, wellness, immunity...'
  },
  '/category/baby-care': {
    bg: '#FEF3C7',
    border: '#FDE68A',
    accent: '#D97706',
    placeholder: 'Search diapers, wipes, baby food...'
  },
  '/category/pet-care': {
    bg: '#FFF1F2',
    border: '#FECDD3',
    accent: '#E11D48',
    placeholder: 'Search dog food, cat food, pet supplies...'
  },
  '/category/meat-seafood': {
    bg: '#FEF2F2',
    border: '#FECACA',
    accent: '#DC2626',
    placeholder: 'Search fresh chicken, meat, fish, eggs...'
  },
  '/fresh-produce': {
    bg: '#EAF8F0',
    border: '#A7F3D0',
    accent: '#34C759',
    placeholder: 'Search fresh fruits, vegetables, greens...'
  },
  '/chicken-meat': {
    bg: '#FEF2F2',
    border: '#FECACA',
    accent: '#DC2626',
    placeholder: 'Search fresh chicken, mutton, seafood...'
  }
};

export default function Header() {
  const { totalItems, toPay } = useCart();
  const locationCtx = useDeliveryLocation() || {};
  const location = locationCtx.location || { area: 'Select Location', city: '', pincode: '', radius: '' };
  const setIsModalOpen = locationCtx.setIsModalOpen || (() => {});
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [showLoginConfirmModal, setShowLoginConfirmModal] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState(getRealUserNotifications);

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(getRealUserNotifications());
    };
    refreshNotifications();
    window.addEventListener('storage', refreshNotifications);
    window.addEventListener('grabit_orders_updated', refreshNotifications);
    window.addEventListener('grabit_notifications_updated', refreshNotifications);
    return () => {
      window.removeEventListener('storage', refreshNotifications);
      window.removeEventListener('grabit_orders_updated', refreshNotifications);
      window.removeEventListener('grabit_notifications_updated', refreshNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = notificationFilter === 'all'
    ? notifications
    : notifications.filter(n => n.category === notificationFilter);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const isSearchingRef = useRef(false);

  const navigate = useNavigate();
  const routerLocation = useLocation();
  const locationPath = routerLocation.pathname;
  const isHomePage = locationPath === '/';
  const isCategoryPage = locationPath.startsWith('/category');
  const showCategoryStrip = isHomePage || isCategoryPage;
  const currentTheme = CATEGORY_HEADER_THEMES[locationPath] || CATEGORY_HEADER_THEMES['/'];
  const w = useWindowWidth();
  const isMobile = w <= 768;

  // Handle outside click to hide search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (desktopSearchRef.current && desktopSearchRef.current.contains(e.target)) ||
        (mobileSearchRef.current && mobileSearchRef.current.contains(e.target))
      ) {
        return;
      }
      setIsSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNotificationOutside = (e) => {
      if (isNotificationOpen && notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleNotificationOutside);
    document.addEventListener('touchstart', handleNotificationOutside);
    return () => {
      document.removeEventListener('mousedown', handleNotificationOutside);
      document.removeEventListener('touchstart', handleNotificationOutside);
    };
  }, [isNotificationOpen]);

  const trackCustomerSearch = (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim().toLowerCase();
    try {
      const existing = JSON.parse(localStorage.getItem('grabit_often_searched') || '[]');
      const item = existing.find(x => x.query.toLowerCase() === clean);
      const newCount = (item ? item.count : 0) + 1;
      const filtered = existing.filter(x => x.query.toLowerCase() !== clean);
      const updated = [{ query: query.trim(), count: newCount, timestamp: Date.now() }, ...filtered].slice(0, 8);
      localStorage.setItem('grabit_often_searched', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const getOftenSearched = () => {
    try {
      return JSON.parse(localStorage.getItem('grabit_often_searched') || '[]');
    } catch {
      return [];
    }
  };

  const clearOftenSearched = (e) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('grabit_often_searched');
      setIsSearchFocused(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = searchQuery.trim();
    if (!query || isSearchingRef.current) return;
    isSearchingRef.current = true;
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 600);

    trackCustomerSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
    setIsSearchFocused(false);
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
    setMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleSelectPortal = (role, targetPath) => {
    setIsProfileMenuOpen(false);

    if (role === 'customer') {
      const userObj = {
        id: 4,
        role: 'customer',
        name: 'Rahul Sharma',
        full_name: 'Rahul Sharma',
        phone: '+919999900004',
        email: 'customer@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      navigate('/');
    } else if (role === 'seller') {
      const userObj = {
        id: 2,
        role: 'seller',
        name: 'GrabIt Supermarket',
        full_name: 'GrabIt Supermarket',
        phone: '+919999900002',
        email: 'seller@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      localStorage.setItem('grabit_seller_access', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      navigate('/seller/dashboard');
    } else if (role === 'delivery_agent') {
      const userObj = {
        id: 3,
        role: 'delivery_agent',
        name: 'Speedy Express Delivery',
        full_name: 'Speedy Express Delivery',
        phone: '+919999900003',
        email: 'rider@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      navigate('/delivery/dashboard');
    } else if (role === 'admin') {
      const userObj = {
        id: 1,
        role: 'admin',
        name: 'Admin Supervisor',
        full_name: 'Admin Supervisor',
        phone: '+919999900001',
        email: 'admin@grabit.local'
      };
      localStorage.setItem('grabit_session', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      localStorage.setItem('grabit_seller_access', localStorage.getItem('grabit_session') || 'demo-token');
      localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      navigate('/admin');
    }
  };

  const isProfilePage = routerLocation.pathname === '/profile';

  const matchingProducts = searchQuery.trim() ? searchProducts(searchQuery.trim()).slice(0, 5) : [];

  const categorySuggestions = searchQuery.trim() ? (
    (() => {
      const q = searchQuery.toLowerCase().trim();
      const allCategoryKeys = [
        { slug: 'produce', name: 'Fresh Fruits & Veggies', words: ['fruits', 'veggies', 'vegetables', 'apple', 'banana', 'tomato', 'onion', 'produce'] },
        { slug: 'dairy-bakery', name: 'Dairy & Bakery', words: ['dairy', 'milk', 'cheese', 'butter', 'bread', 'paneer', 'bakery', 'dahi', 'curd'] },
        { slug: 'beverages', name: 'Cold Drinks & Juices', words: ['beverages', 'drinks', 'coke', 'pepsi', 'juice', 'soda', 'cold drink'] },
        { slug: 'snacks-munchies', name: 'Snacks & Munchies', words: ['snacks', 'munchies', 'chips', 'lays', 'kurkure', 'namkeen', 'biscuit'] },
        { slug: 'staples', name: 'Atta, Rice & Dal', words: ['staples', 'atta', 'rice', 'dal', 'flour', 'pulses', 'chawal', 'wheat'] },
        { slug: 'chocolates', name: 'Chocolates & Sweets', words: ['chocolate', 'chocolates', 'sweets', 'cadbury', 'silk', 'mithai'] },
        { slug: 'personal-care', name: 'Personal Care', words: ['personal care', 'soap', 'shampoo', 'toothpaste', 'brush', 'body wash'] },
        { slug: 'baby-care', name: 'Baby Care', words: ['baby', 'baby care', 'diaper', 'diapers', 'pampers', 'wipes', 'cerelac'] },
        { slug: 'pet-care', name: 'Pet Care & Food', words: ['pet', 'pet care', 'dog', 'cat', 'dog food', 'cat food', 'pedigree', 'whiskas'] },
        { slug: 'beauty-cosmetics', name: 'Beauty & Cosmetics', words: ['beauty', 'cosmetics', 'makeup', 'lipstick', 'kajal', 'skin'] },
        { slug: 'health-wellness', name: 'Health & Wellness', words: ['health', 'wellness', 'pharmacy', 'medicine', 'vitamins', 'dettol'] },
        { slug: 'meat-seafood', name: 'Meat & Seafood', words: ['meat', 'chicken', 'fish', 'eggs', 'egg', 'seafood', 'mutton'] },
        { slug: 'home-kitchen', name: 'Home & Kitchen', words: ['home', 'kitchen', 'cookware', 'pan', 'cooker', 'flask', 'bottle'] },
        { slug: 'stationery-office', name: 'Stationery & Office', words: ['stationery', 'office', 'notebook', 'pen', 'pencil', 'book', 'paper'] },
        { slug: 'sports-fitness', name: 'Sports & Fitness', words: ['sports', 'fitness', 'cricket', 'badminton', 'gym', 'yoga', 'protein'] },
        { slug: 'toys-games', name: 'Toys & Games', words: ['toys', 'games', 'game', 'puzzle', 'board game', 'toy'] },
        { slug: 'pooja-needs', name: 'Pooja Needs', words: ['pooja', 'agarbatti', 'diya', 'incense', 'camphor', 'dhoop', 'puja'] }
      ];
      return allCategoryKeys.filter(c => {
        return c.slug.includes(q) || c.name.toLowerCase().includes(q) || c.words.some(w => q.includes(w) || w.includes(q));
      }).slice(0, 2);
    })()
  ) : [];

  const brandSuggestions = searchQuery.trim() ? (
    [...new Set(matchingProducts.map(p => p.brand).filter(Boolean))].slice(0, 3)
  ) : [];

  const renderSearchSuggestions = () => {
    if (!isSearchFocused) return null;
    const oftenSearched = getOftenSearched();

    if (searchQuery.trim().length === 0) {
      if (oftenSearched.length === 0) return null;
      return (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
            zIndex: 99999,
            overflow: 'hidden',
            padding: '12px 0'
          }}
        >
          <div>
            <div style={{ padding: '4px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                🔍 Often &amp; Recently Searched
              </span>
              <button
                type="button"
                onClick={clearOftenSearched}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '10.5px', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 14px 4px' }}>
              {oftenSearched.map(item => (
                <button
                  key={item.query}
                  type="button"
                  onMouseDown={() => {
                    trackCustomerSearch(item.query);
                    setSearchQuery(item.query);
                    navigate(`/search?q=${encodeURIComponent(item.query)}`);
                    setIsSearchFocused(false);
                  }}
                  style={{
                    background: '#EFF6FF', border: '1.5px solid #BFDBFE',
                    borderRadius: '20px', padding: '5px 12px', fontSize: '12px',
                    fontWeight: 700, color: '#1E40AF', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🕒</span>
                  <span>{item.query}</span>
                  {item.count > 1 && (
                    <span style={{ fontSize: '10px', background: '#DBEAFE', padding: '1px 6px', borderRadius: '10px', color: '#1E3A8A' }}>
                      {item.count}x
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
          zIndex: 99999,
          overflow: 'hidden',
          padding: '12px 0'
        }}
      >
        <div>
            {categorySuggestions.length > 0 && (
              <div style={{ padding: '4px 14px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid #F1F5F9', marginBottom: '8px' }}>
                {categorySuggestions.map(c => (
                  <button
                    key={c.slug}
                    type="button"
                    onMouseDown={() => {
                      navigate(`/category/${c.slug}`);
                      setIsSearchFocused(false);
                    }}
                    style={{
                      background: '#EFF6FF', border: '1px solid #BFDBFE',
                      borderRadius: '16px', padding: '5px 12px', fontSize: '11.5px',
                      fontWeight: 700, color: '#1E40AF', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>📂 Explore in <strong>{c.name}</strong></span>
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            )}
            {brandSuggestions.length > 0 && (
              <div style={{ padding: '2px 14px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {brandSuggestions.map(b => (
                  <button
                    key={b}
                    type="button"
                    onMouseDown={() => {
                      setSearchQuery(b);
                      navigate(`/search?q=${encodeURIComponent(b)}`);
                      setIsSearchFocused(false);
                    }}
                    style={{
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '14px', padding: '3px 9px', fontSize: '11px',
                      fontWeight: 700, color: '#475569', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <span>🏷️ Brand: <strong>{b}</strong></span>
                  </button>
                ))}
              </div>
            )}
            <div style={{ padding: '4px 16px 6px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Product Suggestions ({matchingProducts.length})
            </div>
            {matchingProducts.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', margin: '4px 12px 12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                  No matches for "{searchQuery}"
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px', fontWeight: 500 }}>
                  Can't find what you're looking for? Suggest it to us!
                </p>
                <button
                  onMouseDown={() => {
                    setIsSuggestionModalOpen(true);
                    setIsSearchFocused(false);
                  }}
                  style={{
                    background: '#0071E3', color: '#FFFFFF', border: 'none',
                    borderRadius: '10px', padding: '8px 16px', fontSize: '12px',
                    fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(0, 113, 227, 0.2)'
                  }}
                >
                  <Lightbulb size={14} color="#FFFFFF" />
                  <span>Suggest "{searchQuery}" to Grabit</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {matchingProducts.map(prod => (
                  <div
                    key={prod.id}
                    onMouseDown={() => {
                      navigate(`/product/${getProductSlug(prod)}`);
                      setIsSearchFocused(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 16px', cursor: 'pointer',
                      borderBottom: '1px solid #F8FAFC',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ProductSvg name={prod.image} size={28} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{prod.volume || prod.weight}</span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: '#0071E3' }}>₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '10.5px' }}>₹{prod.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} color="#94A3B8" />
                  </div>
                ))}
              </div>
            )}
            <div
              onMouseDown={() => {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setIsSearchFocused(false);
              }}
              style={{
                padding: '10px 16px', background: '#EFF6FF', color: '#0071E3',
                fontSize: '12.5px', fontWeight: 900, textAlign: 'center',
                cursor: 'pointer', borderTop: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <span>View all results for "{searchQuery}"</span>
              <ArrowRight size={14} />
            </div>

            <div
              onMouseDown={() => {
                setIsSuggestionModalOpen(true);
                setIsSearchFocused(false);
              }}
              style={{
                padding: '10px 16px', background: '#F8FAFC', color: '#0071E3',
                fontSize: '12px', fontWeight: 800, textAlign: 'center',
                cursor: 'pointer', borderTop: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Lightbulb size={14} color="#0071E3" />
              <span>Can't find an item? Suggest a product to Grabit</span>
            </div>
          </div>
        </div>
    );
  };

  {/* 🔔 NOTIFICATIONS MODAL (MATCHING SAVED DELIVERY LOCATIONS MODAL EXACTLY) */}
  const renderNotificationModal = () => (
    <div
      onClick={() => setIsNotificationOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid #E2E8F0',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Sticky Fixed Modal Header / Close Bar - Always visible when scrolling */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: '#FFFFFF',
          padding: '18px 22px 14px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{
                fontSize: '9.5px',
                fontWeight: 900,
                color: '#FFFFFF',
                background: '#0071E3',
                padding: '2px 8px',
                borderRadius: '10px',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }}>
                {unreadCount} NEW
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(false)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; }}
            aria-label="Close"
          >
            <X size={19} strokeWidth={2.4} />
          </button>
        </div>

        {/* Scrollable Notification Cards List */}
        <div style={{
          padding: '16px 20px 20px',
          overflowY: 'auto',
          flex: 1,
          overscrollBehavior: 'contain'
        }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', marginBottom: '16px' }}>
              <Bell size={36} color="#94A3B8" style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>No notifications yet</div>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                When you place an order, live delivery tracking and order status updates will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {notifications.map((item) => {
                const isSelected = item.unread;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      markNotificationAsRead(item.id);
                      setNotifications(getRealUserNotifications());
                      if (item.link) {
                        setIsNotificationOpen(false);
                        navigate(item.link);
                      }
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: isSelected ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                      background: isSelected ? '#F8FAFC' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 3px 12px rgba(0,113,227,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#0071E3';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,113,227,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = isSelected ? '#BFDBFE' : '#E2E8F0';
                      e.currentTarget.style.boxShadow = isSelected ? '0 3px 12px rgba(0,113,227,0.06)' : '0 1px 3px rgba(0,0,0,0.02)';
                    }}
                  >
                    {/* Left Icon Badge */}
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: item.iconType === 'truck' ? '#EFF6FF' : item.iconType === 'refund' ? '#ECFDF5' : '#F1F5F9',
                      border: `1px solid ${item.iconType === 'truck' ? '#DBEAFE' : item.iconType === 'refund' ? '#A7F3D0' : '#E2E8F0'}`
                    }}>
                      {item.iconType === 'truck' && <Truck size={18} color="#0071E3" strokeWidth={2.2} />}
                      {item.iconType === 'refund' && <Wallet size={18} color="#059669" strokeWidth={2.2} />}
                      {item.iconType === 'package' && <Package size={18} color="#475569" strokeWidth={2.2} />}
                    </div>

                    {/* Right Content Column */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {/* Top Line: Title + Badge + Time + Dismiss */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {isSelected && (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              color: '#0071E3',
                              background: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              padding: '1px 6px',
                              borderRadius: '8px',
                              letterSpacing: '0.3px',
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}>
                              NEW
                            </span>
                          )}
                          <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                            {item.time}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(item.id);
                              setNotifications(getRealUserNotifications());
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'color 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                            title="Dismiss"
                            aria-label="Dismiss notification"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Body Message: Clean, readable, professional font */}
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#475569', lineHeight: 1.45 }}>
                        {item.message}
                      </div>

                      {/* Bottom Row: Status Badge + Action Link */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: item.statusColor || '#0071E3',
                          background: item.statusBg || '#EFF6FF',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {item.statusBadge || '⚡ Express Delivery'}
                        </span>

                        {item.actionText && (
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 800,
                            color: '#0071E3',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            {item.actionText} <ChevronRight size={13} strokeWidth={2.5} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Primary Action Button: Mark All as Read (when there are unread notifications) */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                markAllNotificationsAsRead();
                setNotifications(getRealUserNotifications());
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: '#0071E3',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                marginBottom: '10px',
                boxShadow: '0 4px 14px rgba(0, 113, 227, 0.22)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#005bb5'}
              onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
            >
              <CheckCheck size={16} color="#FFFFFF" strokeWidth={2.4} />
              <span>Mark All as Read</span>
            </button>
          )}

          {/* Secondary Action Button */}
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen(false);
              navigate(notifications.length > 0 ? '/notifications' : '/');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#0F172A',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          >
            <span>{notifications.length > 0 ? 'View Full Notifications Center' : 'Browse Products'}</span>
            <ChevronRight size={14} strokeWidth={2.4} color="#64748B" />
          </button>
        </div>
      </div>
    </div>

  );

  return (
    <>
      {!isProfilePage && (
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          margin: 0, width: '100%',
          paddingTop: isMobile ? '8px' : '14px',
          paddingBottom: isMobile ? '6px' : '14px',
          background: currentTheme.bg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1.5px solid ${currentTheme.border}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'background 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
        {/* Main Header Container */}
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          minHeight: isMobile ? 'auto' : '72px',
          padding: isMobile ? '6px 12px 2px' : 0,
          gap: isMobile ? '6px' : '20px'
        }}>

          {/* 1. Brand Logo & Back Navigation (Desktop) */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              {!isHomePage && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#0F172A',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  aria-label="Go Back"
                  title="Go Back"
                  onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; }}
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img
                  src="/grabit-logo.png"
                  alt="Grabit"
                  style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
                />
              </Link>
            </div>
          )}

          {/* 2. Sleek Delivery Location */}
          {!isMobile && (
            <div
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'flex', flexDirection: 'column', cursor: 'pointer',
                padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 900, color: '#34C759', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                <Zap size={13} color="#34C759" fill="#34C759" />
                <span>Delivery in 10-15 mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 800, color: '#1D1D1F', marginTop: '1px', maxWidth: '240px' }}>
                <MapPin size={15} color="#0071E3" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(() => {
                    const tag = (location?.tag || '').trim();
                    const area = (location?.area || '').trim();
                    let cityStr = (location?.city || '').trim().replace(/\d{5,6}/g, '').replace(/,\s*$/, '').trim();
                    let mainLoc = area || cityStr || 'Select Location';
                    if (area && cityStr && !area.toLowerCase().includes(cityStr.toLowerCase())) {
                      mainLoc = `${area}, ${cityStr}`;
                    }
                    if (tag && tag !== 'Location' && tag !== 'Select Location' && tag !== 'Current Location') {
                      return `${tag} • ${mainLoc}`;
                    }
                    return mainLoc;
                  })()}
                </span>
                <ChevronDown size={13} color="#86868B" style={{ flexShrink: 0 }} />
              </div>
            </div>
          )}



          {/* ── MOBILE CLEAN ZEPTO-STYLE HEADER ── */}
          {isMobile ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Row 1: Brand Logo & Location + Live 10-Min Badge + Reward Box + Profile */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                      <img
                        src="/grabit-logo.png"
                        alt="Grabit"
                        style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
                      />
                    </Link>
                  </div>

                  <div
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      fontSize: '12px', fontWeight: 800, color: '#1E293B',
                      display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', cursor: 'pointer',
                      maxWidth: 'calc(100vw - 160px)', overflow: 'hidden'
                    }}
                  >
                    <MapPin size={13} color="#0071E3" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 800 }}>
                      {(() => {
                        const tag = (location?.tag || '').trim();
                        const area = (location?.area || '').trim();
                        let cityStr = (location?.city || '').trim().replace(/\d{5,6}/g, '').replace(/,\s*$/, '').trim();
                        let mainLoc = area || cityStr || 'Select Location';
                        if (area && cityStr && !area.toLowerCase().includes(cityStr.toLowerCase())) {
                          mainLoc = `${area}, ${cityStr}`;
                        }
                        if (tag && tag !== 'Location' && tag !== 'Select Location' && tag !== 'Current Location') {
                          return `${tag} • ${mainLoc}`;
                        }
                        return mainLoc;
                      })()}
                    </span>
                    <ChevronDown size={12} color="#0071E3" style={{ flexShrink: 0 }} />
                  </div>
                </div>

                {/* Right Side: Notification & Cart Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen(true)}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#FFFFFF', border: '1.5px solid #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)', color: '#0F172A',
                      position: 'relative', cursor: 'pointer', padding: 0
                    }}
                    aria-label="Notifications"
                  >
                    <Bell size={18} color="#0071E3" />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: '#FF3B30', color: '#FFFFFF', fontSize: '10px', fontWeight: 900,
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid #FFFFFF', boxShadow: '0 2px 6px rgba(255,59,48,0.4)'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <Link
                    to="/cart"
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#FFFFFF', border: '1.5px solid #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)', textDecoration: 'none', color: '#0F172A',
                      position: 'relative'
                    }}
                  >
                    <ShoppingBag size={18} color="#0071E3" />
                    {totalItems > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: '#FF3B30', color: '#FFFFFF', fontSize: '10px', fontWeight: 900,
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid #FFFFFF', boxShadow: '0 2px 6px rgba(255,59,48,0.4)'
                      }}>
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Row 3: Clean Search Input with Back Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '6px' }}>
                {!isHomePage && (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#0F172A',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                    aria-label="Go Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <form ref={mobileSearchRef} onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} color="#64748B" style={{ position: 'absolute', left: '14px', top: '12px', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder={currentTheme.placeholder}
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={e => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                    style={{
                      width: '100%', height: '40px',
                      paddingLeft: '38px', paddingRight: '14px',
                      borderRadius: '10px', border: '1px solid #CBD5E1',
                      fontSize: '13px', background: '#FFFFFF', outline: 'none',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
                    }}
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchQuery('');
                        setIsSearchFocused(true);
                      }}
                      style={{
                        position: 'absolute', right: '10px', top: '10px',
                        background: '#E2E8F0', border: 'none', borderRadius: '50%',
                        width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', zIndex: 2
                      }}
                      aria-label="Clear search"
                    >
                      <X size={12} color="#64748B" />
                    </button>
                  )}
                  {renderSearchSuggestions()}
                </form>
              </div>

            </div>
          ) : (
            /* ── DESKTOP HEADER CONTINUATION ── */
            <>
              {/* 4. Main Prominent Search Bar */}
              <form ref={desktopSearchRef} onSubmit={handleSearch} style={{
                flex: 1, display: 'flex', alignItems: 'center',
                position: 'relative', maxWidth: '520px'
              }}>
                <Search size={16} color="#86868B" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search for milk, chips, coke, snacks and more..."
                  value={searchQuery}
                  onFocus={e => {
                    setIsSearchFocused(true);
                    e.currentTarget.style.borderColor = '#0071E3';
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.1)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#D2D2D7';
                    e.currentTarget.style.background = '#F5F5F7';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                  style={{
                    width: '100%', height: '44px',
                    paddingLeft: '40px', paddingRight: '85px',
                    borderRadius: '10px', border: '1.5px solid #D2D2D7',
                    fontSize: '13px', background: '#F5F5F7', outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchQuery('');
                      setIsSearchFocused(true);
                    }}
                    style={{
                      position: 'absolute', right: '88px',
                      background: '#E2E8F0', border: 'none', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', zIndex: 2
                    }}
                    aria-label="Clear search"
                  >
                    <X size={12} color="#64748B" />
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    position: 'absolute', right: '4px',
                    height: '36px', padding: '0 16px',
                    background: '#0071E3', color: 'white',
                    border: 'none', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                    transition: 'background 0.15s',
                    boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0058B3'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0071E3'}
                >
                  Search
                </button>
                {renderSearchSuggestions()}
              </form>
            </>
          )}

          {/* 5. Desktop Right Action Controls */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              
              {/* 🤍 Wishlist Button - Stacked Icon + Text */}
              <Link
                to="/wishlist"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '2px', textDecoration: 'none', color: '#1D1D1F', position: 'relative',
                  padding: '4px 10px', borderRadius: '8px', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={22} color={wishlistCount > 0 ? '#FF3B30' : '#1D1D1F'} fill={wishlistCount > 0 ? '#FF3B30' : 'none'} strokeWidth={1.8} />
                  {wishlistCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-10px',
                      background: '#FF3B30', color: '#FFFFFF',
                      fontSize: '10px', fontWeight: 900,
                      width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #FFFFFF', boxShadow: '0 2px 6px rgba(255,59,48,0.3)'
                    }}>
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>Wishlist</span>
              </Link>

              {/* 👤 Profile Button - Direct Link to /profile */}
              <Link
                to="/profile"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '2px', textDecoration: 'none', color: '#1D1D1F',
                  padding: '4px 10px', borderRadius: '8px', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <User size={22} color="#1D1D1F" strokeWidth={1.8} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>Profile</span>
              </Link>

              {/* 🔔 Notification Alerts Button */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '2px', background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 10px', borderRadius: '8px', transition: 'all 0.15s ease',
                  position: 'relative', color: '#1D1D1F'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Notifications"
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={22} color={unreadCount > 0 ? '#0071E3' : '#1D1D1F'} strokeWidth={1.8} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-10px',
                      background: '#FF3B30', color: '#FFFFFF',
                      fontSize: '10px', fontWeight: 900,
                      width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #FFFFFF', boxShadow: '0 2px 6px rgba(255,59,48,0.3)'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>Alerts</span>
              </button>

              {/* 🛒 Cart Button - Stacked Icon + Text with Badge */}
              <Link
                to="/cart"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '2px', textDecoration: 'none', color: '#1D1D1F', position: 'relative',
                  padding: '4px 10px', borderRadius: '8px', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={22} color="#1D1D1F" strokeWidth={1.8} />
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-10px',
                      background: '#34C759', color: '#FFFFFF',
                      fontSize: '10px', fontWeight: 900,
                      width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #FFFFFF', boxShadow: '0 2px 6px rgba(52,199,89,0.3)'
                    }}>
                      {totalItems}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>Cart</span>
              </Link>
            </div>
          )}
        </div>
      </header>
      )}

      {/* Static Spacer for Fixed Header */}
      {!isProfilePage && (
        <div style={{ height: isMobile ? '128px' : '76px', width: '100%', flexShrink: 0 }} />
      )}

      {/* 📱 NON-STICKY MICRO CATEGORY VISUAL STRIP (Scrolls away naturally with page content) */}
      {isMobile && showCategoryStrip && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '6px 0 4px'
        }}>
          <div style={{
            display: 'flex', gap: '14px', overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            whiteSpace: 'nowrap', flexWrap: 'nowrap',
            paddingTop: '6px', paddingBottom: '8px',
            paddingLeft: '16px', paddingRight: '16px',
            alignItems: 'center'
          }}>
            {[
              { name: 'All', link: '/', img: 'fresh-groceries-basket-only.png', color: '#0071E3' },
              { name: 'Fresh', link: '/category/produce', img: 'apples-real.jpg', color: '#34C759' },
              { name: 'Dairy', link: '/category/dairy-bakery', img: 'butter-real.jpg', color: '#0284C7' },
              { name: 'Snacks', link: '/category/snacks-munchies', img: 'lays-magic-masala.png', color: '#D97706' },
              { name: 'Drinks', link: '/category/beverages', img: 'coca-cola-real.jpg', color: '#FF3B30' },
              { name: 'Atta', link: '/category/staples', img: 'atta-real.jpg', color: '#65A30D' },
              { name: 'Sweets', link: '/category/chocolates', img: 'cadbury-silk-real.jpg', color: '#7E22CE' },
              { name: 'Care', link: '/category/personal-care', img: 'dettol-handwash-real.jpg', color: '#EC4899' },
              { name: 'Household', link: '/category/household', img: 'surf-excel-real.jpg', color: '#2563EB' },
              { name: 'Biscuits', link: '/category/biscuits', img: 'oreo-biscuits-real.jpg', color: '#D97706' },
              { name: 'Oils & Ghee', link: '/category/oil', img: 'fortune-oil-real.jpg', color: '#CA8A04' },
              { name: 'Electronics', link: '/category/electronics', img: 'electronics-hero-transparent.png', color: '#8B5CF6' },
              { name: 'Fashion', link: '/category/fashion', img: 'sneakers.jpg', color: '#F43F5E' },
              { name: 'Baby Care', link: '/category/baby-care', img: 'category-baby-care.jpg', color: '#0284C7' },
              { name: 'Pet Care', link: '/category/pet-care', img: 'category-pet-care.jpg', color: '#EA580C' },
              { name: 'Beauty', link: '/category/beauty-cosmetics', img: 'category-beauty-cosmetics.jpg', color: '#E11D48' },
              { name: 'Pharma', link: '/category/health-wellness', img: 'category-health-wellness.jpg', color: '#16A34A' },
              { name: 'Meat & Seafood', link: '/category/meat-seafood', img: 'category-meat-seafood.jpg', color: '#DC2626' },
              { name: 'Kitchen', link: '/category/home-kitchen', img: 'category-home-kitchen.jpg', color: '#EA580C' },
              { name: 'Stationery', link: '/category/stationery-office', img: 'category-stationery-office.jpg', color: '#2563EB' },
              { name: 'Fitness', link: '/category/sports-fitness', img: 'category-sports-fitness.jpg', color: '#16A34A' },
              { name: 'Toys', link: '/category/toys-games', img: 'category-toys-games.jpg', color: '#9333EA' },
              { name: 'Pooja', link: '/category/pooja-needs', img: 'category-pooja-needs.jpg', color: '#D97706' },
            ].map((item, idx) => {
              const currentCatSlug = locationPath.startsWith('/category/') ? getCanonicalSlug(locationPath.replace('/category/', '')) : null;
              const itemCatSlug = item.link.startsWith('/category/') ? getCanonicalSlug(item.link.replace('/category/', '')) : null;
              const isActive = locationPath === item.link || (currentCatSlug && itemCatSlug && currentCatSlug === itemCatSlug);
              return (
                <Link
                  key={idx}
                  to={item.link}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    textDecoration: 'none', flexShrink: 0,
                    position: 'relative', paddingBottom: '8px', paddingTop: '2px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '13px',
                    background: '#FFFFFF',
                    border: isActive ? `2px solid ${item.color}` : '1.5px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isActive ? `0 4px 12px ${item.color}30` : '0 2px 5px rgba(0,0,0,0.04)',
                    transform: isActive ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    <ProductSvg name={item.img} size={34} />
                  </div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: isActive ? 900 : 700,
                    color: isActive ? item.color : '#64748B',
                    transition: 'color 0.2s ease, font-weight 0.2s ease'
                  }}>
                    {item.name}
                  </span>

                  {/* Smooth Active Indicator Bar */}
                  <div style={{
                    position: 'absolute', bottom: '1px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: isActive ? '24px' : '0%',
                    height: '3px', borderRadius: '4px',
                    background: item.color,
                    opacity: isActive ? 1 : 0,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 📱 ZEPTO-STYLE MOBILE FIXED BOTTOM NAVIGATION BAR MOVED TO GLOBAL COMPONENT */}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* 🎁 LUCKY REWARD SCRATCH & WIN MODAL */}
      {isRewardModalOpen && (
        <div
          onClick={() => setIsRewardModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
              borderRadius: '28px', maxWidth: '420px', width: '100%',
              padding: '28px 24px', boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
              border: '2px solid #FDBA74', textAlign: 'center', position: 'relative'
            }}
          >
            <button
              onClick={() => setIsRewardModalOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#F1F5F9', border: 'none', fontSize: '16px',
                fontWeight: 900, cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#FFFFFF', fontSize: '32px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              boxShadow: '0 8px 20px rgba(217,119,6,0.35)'
            }}>
              🎁
            </div>

            <span style={{ fontSize: '11px', fontWeight: 900, color: '#D97706', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              DAILY LUCKY REWARD UNLOCKED
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '4px 0 8px' }}>
              You Won ₹100 Cashback!
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4', margin: '0 0 18px' }}>
              Use coupon code <strong style={{ color: '#0066FF' }}>GRABIT100</strong> on your next order above ₹299 to claim instant discount & free delivery!
            </p>

            <div style={{
              background: '#FFFFFF', border: '2px dashed #FDBA74',
              borderRadius: '16px', padding: '14px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>PROMO CODE</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', letterSpacing: '1px' }}>GRABIT100</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('GRABIT100');
                  setCopiedCoupon(true);
                  setTimeout(() => setCopiedCoupon(false), 2500);
                }}
                style={{
                  background: copiedCoupon ? '#10B981' : '#D97706', color: '#FFFFFF',
                  border: 'none', padding: '8px 16px', borderRadius: '10px',
                  fontSize: '12px', fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(217,119,6,0.25)'
                }}
              >
                {copiedCoupon ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>

            <button
              onClick={() => setIsRewardModalOpen(false)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #0066FF, #0043A8)',
                color: '#FFFFFF', border: 'none', padding: '14px',
                borderRadius: '14px', fontSize: '14px', fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,102,255,0.35)'
              }}
            >
              Shop & Apply Code Now
            </button>
          </div>
        </div>
      )}

      {/* 🔐 CONFIRMATION MODAL BEFORE REDIRECTING TO LOGIN */}
      {showLoginConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px',
            maxWidth: '380px', width: '100%', padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)', textAlign: 'center',
            border: '1px solid #E2E8F0', position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowLoginConfirmModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#F1F5F9', border: 'none', fontSize: '14px',
                fontWeight: 700, color: '#64748B', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#EFF6FF', color: '#0071E3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', border: '1.5px solid #BFDBFE'
            }}>
              <LogIn size={24} color="#0071E3" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Redirect to Login Page?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to open the Login & Authentication portal?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLoginConfirmModal(false)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: '12px',
                  background: '#F1F5F9', border: '1px solid #CBD5E1',
                  color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLoginConfirmModal(false);
                  navigate('/login');
                }}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: '12px',
                  background: '#0071E3', border: 'none',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,113,227,0.3)'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 Product Suggestion Modal */}
      <ProductSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        prefillQuery={searchQuery}
      />

      {/* 🔔 Notifications Modal (Exact Saved Delivery Locations Model) */}
      {isNotificationOpen && renderNotificationModal()}
    </>
  );
}
