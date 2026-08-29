import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ChevronDown, ChevronLeft, ArrowLeft, Search, User, ShoppingBag, ShoppingCart, Menu, X, LayoutGrid, Zap, Package, Heart, LogIn, Home, TrendingUp, Sparkles, ArrowRight, Store, Truck, ShieldCheck, Lightbulb } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useDeliveryLocation } from '../../context/LocationContext';
import { useWishlist } from '../../context/WishlistContext';
import AuthModal from './AuthModal';
import FestiveSubHeader from './FestiveSubHeader';
import ProductSvg from './ProductSvg';
import ProductSuggestionModal from './ProductSuggestionModal';
import useWindowWidth from '../../hooks/useWindowWidth';
import { searchProducts } from '../../data/products';
import { getCanonicalSlug } from '../../data/categories';

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
      { name: 'Eggs & Farm Items', link: '/category/produce', icon: '🥚' },
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
      { name: 'Tea, Coffee & Drinks', link: '/category/beverages', icon: '☕' },
      { name: 'Instant Noodles & Pasta', link: '/category/staples', icon: '🍜' },
    ]
  },
  {
    title: 'Household & Lifestyle',
    icon: '⚡',
    items: [
      { name: 'Personal Care & Hygiene', link: '/category/personal-care', icon: '🧴' },
      { name: 'Household & Cleaning', link: '/category/household', icon: '🧼' },
      { name: 'Electronics & Audio Gear', link: '/category/electronics', icon: '⚡' },
      { name: 'Fashion & Accessories', link: '/category/fashion', icon: '🕶️' },
      { name: 'Baby Care & Diapers', link: '/category/personal-care', icon: '👶' },
      { name: 'Pet Supplies & Treats', link: '/category/household', icon: '🐾' },
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

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
      setIsSearchFocused(false);
    }
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
  const trendingSearches = [
    { label: "Lay's Chips", query: "lays", icon: '🍿' },
    { label: 'Amul Butter', query: 'butter', icon: '🥛' },
    { label: 'Cadbury Silk', query: 'silk', icon: '🍫' },
    { label: 'Coca-Cola', query: 'coke', icon: '🥤' },
    { label: 'Maggi Noodles', query: 'maggi', icon: '🍜' },
    { label: 'Aashirvaad Atta', query: 'atta', icon: '🌾' }
  ];

  const renderSearchSuggestions = () => {
    if (!isSearchFocused) return null;

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
        {searchQuery.trim().length === 0 ? (
          <div>
            <div style={{ padding: '4px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={12} color="#0071E3" /> Trending Searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 14px 8px' }}>
              {trendingSearches.map(t => (
                <button
                  key={t.query}
                  type="button"
                  onMouseDown={() => {
                    setSearchQuery(t.query);
                    navigate(`/search?q=${encodeURIComponent(t.query)}`);
                    setIsSearchFocused(false);
                  }}
                  style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '20px', padding: '6px 13px', fontSize: '12.5px',
                    fontWeight: 600, color: '#334155', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
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
                      navigate(`/product/${prod.id}`);
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
        )}
      </div>
    );
  };

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

          {/* 1. Brand Logo (Desktop) */}
          {!isMobile && (
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <img
                src="/grabit-logo.png"
                alt="Grabit"
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
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
                <span>Delivery in 30-45 mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 800, color: '#1D1D1F', marginTop: '1px' }}>
                <MapPin size={15} color="#0071E3" strokeWidth={2.2} />
                <span>{location.area}, {location.city}</span>
                <ChevronDown size={13} color="#86868B" />
              </div>
            </div>
          )}



          {/* ── MOBILE CLEAN ZEPTO-STYLE HEADER ── */}
          {isMobile ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Row 1: Brand Logo & Location + Live 10-Min Badge + Reward Box + Profile */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
                      fontSize: '11.5px', fontWeight: 800, color: '#1E293B',
                      display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', cursor: 'pointer'
                    }}
                  >
                    <MapPin size={13} color="#0071E3" strokeWidth={2.2} />
                    <span>Home - {location.area}, {location.city}</span>
                    <ChevronDown size={12} color="#64748B" />
                  </div>
                </div>

                {/* Right Side: Login & Cart Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowLoginConfirmModal(true)}
                    style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#EFF6FF', border: '1.5px solid #BFDBFE',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0, 113, 227, 0.1)', cursor: 'pointer', color: '#0071E3',
                      padding: 0
                    }}
                    title="Login & Portals"
                  >
                    <LogIn size={18} color="#0071E3" />
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

              {/* Row 3: Clean Search Input */}
              <form ref={mobileSearchRef} onSubmit={handleSearch} style={{ width: '100%', position: 'relative', marginBottom: '6px' }}>
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
                {renderSearchSuggestions()}
              </form>

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
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '10px 12px 8px'
        }}>
          <div style={{
            display: 'flex', gap: '14px', overflowX: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            whiteSpace: 'nowrap', flexWrap: 'nowrap'
          }}>
            {[
              { name: 'All', link: '/', img: 'lays-classic-salted.png', color: '#0071E3' },
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
            ].map((item, idx) => {
              const currentCatSlug = locationPath.startsWith('/category/') ? getCanonicalSlug(locationPath.replace('/category/', '')) : null;
              const itemCatSlug = item.link.startsWith('/category/') ? getCanonicalSlug(item.link.replace('/category/', '')) : null;
              const isActive = locationPath === item.link || (currentCatSlug && itemCatSlug && currentCatSlug === itemCatSlug);
              return (
                <Link
                  key={idx}
                  to={item.link}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    textDecoration: 'none', flexShrink: 0,
                    position: 'relative', paddingBottom: '6px',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: '#FFFFFF',
                    border: isActive ? `2.5px solid ${item.color}` : '1.5px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isActive ? `0 6px 16px ${item.color}35` : '0 2px 6px rgba(0,0,0,0.04)',
                    transform: isActive ? 'scale(1.05)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <ProductSvg name={item.img} size={36} />
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 900 : 700,
                    color: isActive ? item.color : '#86868B',
                    transition: 'color 0.2s ease, font-weight 0.2s ease'
                  }}>
                    {item.name}
                  </span>

                  {/* Smooth Active Indicator Bar */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: isActive ? '100%' : '0%',
                    height: '3px', borderRadius: '3px',
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

      {/* 📱 ZEPTO-STYLE MOBILE FIXED BOTTOM NAVIGATION BAR */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '6px 8px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          {[
            { label: 'Home', path: '/', icon: Home, match: p => p === '/' },
            { label: 'Categories', path: '/categories', icon: LayoutGrid, match: p => p.startsWith('/categor') },
            { label: 'Trending', path: '/search?q=trending', icon: TrendingUp, match: p => p.includes('trending') },
            { label: 'Profile', path: '/profile', icon: User, match: p => p === '/profile' }
          ].map(navItem => {
            const IconComponent = navItem.icon;
            const currentFullUrl = routerLocation.pathname + routerLocation.search;
            const isActive = navItem.match(currentFullUrl);
            const activeColor = '#0071E3'; // Primary Blue
            return (
              <Link
                key={navItem.label}
                to={navItem.path}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '3px', flex: 1, textDecoration: 'none',
                  position: 'relative', padding: '4px 0'
                }}
              >
                <div style={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '4px 16px', borderRadius: '16px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <IconComponent
                    size={20}
                    color={isActive ? activeColor : '#64748B'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {navItem.badge > 0 && (
                    <span style={{
                      position: 'absolute', top: '-2px', right: '4px',
                      background: '#34C759', color: '#FFFFFF',
                      fontSize: '10px', fontWeight: 900,
                      width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(52,199,89,0.4)',
                      border: '1.5px solid #FFFFFF'
                    }}>
                      {navItem.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? activeColor : '#64748B',
                  letterSpacing: '-0.2px',
                  transition: 'color 0.2s ease, font-weight 0.2s ease'
                }}>
                  {navItem.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

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
    </>
  );
}
