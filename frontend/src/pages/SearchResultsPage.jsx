import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Search, SlidersHorizontal, X, ArrowUpDown, Filter, ChevronDown } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import { searchProducts, products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

const SORT_OPTIONS = [
  'Relevance',
  'Price: Low to High',
  'Price: High to Low',
  'Rating',
  'Discount'
];

const ALL_CATEGORIES_LIST = [
  { name: 'All Categories', val: 'All', icon: '🛍️' },
  { name: 'Snacks & Munchies', val: 'Snacks & Munchies', icon: '🍿' },
  { name: 'Dairy & Bakery', val: 'Dairy & Bakery', icon: '🥛' },
  { name: 'Cold Drinks & Juices', val: 'Cold Drinks & Juices', icon: '🥤' },
  { name: 'Atta, Rice & Dal', val: 'Atta, Rice & Dal', icon: '🌾' },
  { name: 'Chocolates & Sweets', val: 'Chocolates & Sweets', icon: '🍫' },
  { name: 'Personal Care', val: 'Personal Care', icon: '🧴' },
  { name: 'Household Essentials', val: 'Household Essentials', icon: '🧼' },
  { name: 'Fresh Fruits & Veggies', val: 'Fresh Fruits & Veggies', icon: '🍎' },
  { name: 'Biscuits & Cookies', val: 'Biscuits & Cookies', icon: '🍪' },
  { name: 'Edible Oils & Ghee', val: 'Edible Oils & Ghee', icon: '🛢️' },
  { name: 'Electronics & Gadgets', val: 'Electronics & Gadgets', icon: '⚡' },
  { name: 'Fashion & Accessories', val: 'Fashion & Accessories', icon: '👟' }
];

const CATEGORY_NAMES = {
  'snacks': 'Snacks & Munchies',
  'dairy': 'Dairy & Bakery',
  'beverages': 'Cold Drinks & Juices',
  'staples': 'Atta, Rice & Dal',
  'chocolates': 'Chocolates & Sweets',
  'personal-care': 'Personal Care',
  'household': 'Household Essentials',
  'produce': 'Fresh Fruits & Veggies',
  'biscuits': 'Biscuits & Cookies',
  'oil': 'Edible Oils & Ghee',
  'electronics': 'Electronics & Gadgets',
  'fashion': 'Fashion & Accessories'
};

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allProducts, setAllProducts] = useState(() => [...products]);

  useEffect(() => {
    const handleSync = () => setAllProducts([...products]);
    handleSync();
    window.addEventListener('grabit_products_synced', handleSync);
    window.addEventListener('grabit_products_updated', handleSync);
    return () => {
      window.removeEventListener('grabit_products_synced', handleSync);
      window.removeEventListener('grabit_products_updated', handleSync);
    };
  }, []);

  const initialResults = useMemo(() => {
    if (!query) return allProducts.slice(0, 45);
    const q = query.toLowerCase().trim();
    if (q === 'trending' || q === 'popular' || q === 'top' || q === 'best') {
      return allProducts.filter(p => ['snacks','dairy','beverages','staples','household'].includes(p.category || p.category_slug));
    }
    if (q === 'deals' || q === 'offers' || q === 'discount') {
      return allProducts.filter(p => (p.discount || 0) >= 15);
    }
    if (q === 'all') return allProducts;

    const matches = allProducts.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && String(p.category).toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.unit && p.unit.toLowerCase().includes(q)) ||
      (p.weight && p.weight.toLowerCase().includes(q))
    );
    return matches.length > 0 ? matches : allProducts.filter(p => (p.rating || 0) >= 4.7).slice(0, 30);
  }, [query, allProducts]);

  const [sort, setSort] = useState('Relevance');
  const [activeCat, setActiveCat] = useState('All');
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [activeBrands, setActiveBrands] = useState([]);
  const [activePrice, setActivePrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [brandSearch, setBrandSearch] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isSortModalDropdownOpen, setIsSortModalDropdownOpen] = useState(false);
  const [isPriceModalDropdownOpen, setIsPriceModalDropdownOpen] = useState(false);

  useEffect(() => {
    setActiveCat('All');
    setActiveSubCat('All');
    setActiveBrands([]);
    setActivePrice('');
    setMinRating(0);
    setBrandSearch('');
  }, [query]);

  const w = useWindowWidth();
  const isMobile = w <= 768;

  // Calculate dynamic category counts
  const categoryCounts = { 'All': initialResults.length };
  initialResults.forEach(p => {
    const name = CATEGORY_NAMES[p.category] || p.category;
    categoryCounts[name] = (categoryCounts[name] || 0) + 1;
  });

  // Calculate dynamic brand counts
  const brandCounts = {};
  initialResults.forEach(p => {
    if (p.brand) {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    }
  });

  const availableBrands = Object.keys(brandCounts).filter(b => 
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Dynamic quick sub-category pills based on active query/results
  const subCatPills = [
    { name: 'All', count: initialResults.length, icon: null },
    ...Object.entries(categoryCounts)
      .filter(([cat]) => cat !== 'All')
      .slice(0, 5)
      .map(([catName, count]) => ({
        name: catName,
        count,
        icon: 'lays-classic-salted'
      }))
  ];

  // Dynamic filtering pipeline
  let filtered = [...initialResults];

  if (activeCat !== 'All') {
    filtered = filtered.filter(p => (CATEGORY_NAMES[p.category] || p.category) === activeCat);
  }

  if (activeSubCat !== 'All') {
    filtered = filtered.filter(p => (CATEGORY_NAMES[p.category] || p.category) === activeSubCat);
  }

  if (activeBrands.length > 0) {
    filtered = filtered.filter(p => activeBrands.includes(p.brand));
  }

  if (activePrice === 'Under ₹50') {
    filtered = filtered.filter(p => p.price <= 50);
  } else if (activePrice === '₹50 - ₹100') {
    filtered = filtered.filter(p => p.price > 50 && p.price <= 100);
  } else if (activePrice === '₹100 - ₹200') {
    filtered = filtered.filter(p => p.price > 100 && p.price <= 200);
  } else if (activePrice === 'Above ₹200') {
    filtered = filtered.filter(p => p.price > 200);
  }

  if (minRating > 0) {
    filtered = filtered.filter(p => (p.rating || 4.5) >= minRating);
  }

  // Dynamic sorting
  if (sort === 'Price: Low to High') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'Price: High to Low') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'Rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === 'Discount') {
    filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  const toggleBrand = b => {
    setActiveBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const clearAllFilters = () => {
    setActiveCat('All');
    setActiveSubCat('All');
    setActiveBrands([]);
    setActivePrice('');
    setMinRating(0);
    setSort('Relevance');
  };

  const activeFilterCount = (activeCat !== 'All' ? 1 : 0) + 
    (activeSubCat !== 'All' ? 1 : 0) + 
    activeBrands.length + 
    (activePrice ? 1 : 0) + 
    (minRating > 0 ? 1 : 0);

  const isTrendingQuery = !query || query.toLowerCase() === 'trending' || query.toLowerCase() === 'popular';

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container" style={{ paddingTop: isMobile ? '24px' : '36px' }}>
        {/* Page Header Row with Generous Spacing */}
        <div style={{ marginBottom: '20px', marginTop: '8px' }}>
          <div style={{ marginBottom: '6px' }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
              {isTrendingQuery ? 'Trending Products' : `Results for "${query}"`}
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
            {isTrendingQuery ? 'Handpicked top-rated products delivered fast to your doorstep' : `Showing catalog matches for "${query}"`}
          </p>
        </div>

        {/* 🌟 CLEAN TWO-ROW TOOLBAR: Top Controls + Category Chips */}
        <div style={{ marginBottom: '24px' }}>
          {/* Row 1: Filter Button Left + Sort Selector Right */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '14px', flexWrap: 'wrap'
          }}>
            {/* Filter Modal Open Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: activeFilterCount > 0 ? '#0071E3' : '#FFFFFF',
                color: activeFilterCount > 0 ? '#FFFFFF' : '#0F172A',
                border: activeFilterCount > 0 ? '1.5px solid #0071E3' : '1.5px solid #CBD5E1',
                borderRadius: '24px', padding: '9px 18px', fontSize: '13px', fontWeight: 900,
                cursor: 'pointer', boxShadow: activeFilterCount > 0 ? '0 4px 14px rgba(0,113,227,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap', height: '40px',
                transition: 'all 0.15s ease'
              }}
            >
              <SlidersHorizontal size={16} color={activeFilterCount > 0 ? '#FFFFFF' : '#0071E3'} />
              <span>Filters &amp; Refine</span>
              {activeFilterCount > 0 && (
                <span style={{
                  background: '#FFFFFF', color: '#0071E3',
                  fontSize: '11px', fontWeight: 900, padding: '2px 7px', borderRadius: '10px'
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Custom Sort Selector Dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#FFFFFF', border: isSortDropdownOpen ? '1.5px solid #0071E3' : '1.5px solid #CBD5E1',
                  borderRadius: '24px', padding: '0 16px', height: '40px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 800, color: '#0F172A',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 800 }}>Sort:</span>
                <span>{sort}</span>
                <ChevronDown size={15} color="#64748B" style={{ transform: isSortDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isSortDropdownOpen && (
                <>
                  {/* Invisible backdrop to catch click outside */}
                  <div
                    onClick={() => setIsSortDropdownOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                    background: '#FFFFFF', borderRadius: '16px',
                    border: '1px solid #E2E8F0', boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                    minWidth: '210px', zIndex: 100, padding: '6px',
                    animation: 'fadeIn 0.15s ease'
                  }}>
                    {SORT_OPTIONS.map(o => {
                      const isSelected = sort === o;
                      return (
                        <div
                          key={o}
                          onClick={() => {
                            setSort(o);
                            setIsSortDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px 14px', borderRadius: '10px',
                            fontSize: '13px', fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? '#0071E3' : '#1E293B',
                            background: isSelected ? '#EFF6FF' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: 'pointer', transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span>{o}</span>
                          {isSelected && <Check size={16} color="#0071E3" />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 🌟 ULTRA-EXECUTIVE ACTIVE FILTER BADGES STRIP */}
          {activeFilterCount > 0 && (
            <div style={{
              background: '#FFFFFF', borderRadius: '16px',
              border: '1px solid #E2E8F0', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
              marginTop: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={13} color="#0071E3" />
                <span>Active Filters:</span>
              </span>
              
              {/* Active Category Chip */}
              {activeCat !== 'All' && (
                <span
                  onClick={() => { setActiveCat('All'); setActiveSubCat('All'); }}
                  style={{
                    background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1',
                    borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                >
                  <span>{ALL_CATEGORIES_LIST.find(c => c.val === activeCat)?.icon || '🛍️'} {activeCat}</span>
                  <X size={13} />
                </span>
              )}

              {/* Active Price Range Chip */}
              {activePrice && (
                <span
                  onClick={() => setActivePrice('')}
                  style={{
                    background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1',
                    borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                >
                  <span>🏷️ {activePrice}</span>
                  <X size={13} />
                </span>
              )}

              {/* Active Brands Chips */}
              {activeBrands.map(b => (
                <span
                  key={b}
                  onClick={() => toggleBrand(b)}
                  style={{
                    background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1',
                    borderRadius: '20px', padding: '5px 12px', fontSize: '12px', fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                >
                  <span>{b}</span>
                  <X size={13} />
                </span>
              ))}

              {/* Clear All Pill */}
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5',
                  borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', fontWeight: 800,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  marginLeft: 'auto', transition: 'all 0.15s ease'
                }}
              >
                <span>Clear All</span>
                <X size={12} color="#EF4444" />
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout (Desktop Left Sidebar + Right Products Grid) */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* ── DESKTOP FILTER SIDEBAR (Visible on Desktop > 768px) ── */}
          {!isMobile && (
            <aside style={{
              width: '240px', flexShrink: 0, background: '#FFFFFF',
              borderRadius: '20px', padding: '20px', border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)', position: 'sticky', top: '90px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={16} color="#0071E3" />
                  <span>Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sidebar Category Section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ALL_CATEGORIES_LIST.slice(0, 8).map(cat => {
                    const isSelected = activeCat === cat.val;
                    return (
                      <div
                        key={cat.val}
                        onClick={() => {
                          setActiveCat(cat.val);
                          setActiveSubCat(cat.val);
                        }}
                        style={{
                          padding: '8px 10px', borderRadius: '10px', fontSize: '12.5px',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#0071E3' : '#334155',
                          background: isSelected ? '#EFF6FF' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px' }}>{cat.icon}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{cat.name}</span>
                        </div>
                        {isSelected && <Check size={14} color="#0071E3" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Price Range Section */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                  Price Range
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['Under ₹50', '₹50 - ₹100', '₹100 - ₹200', 'Above ₹200'].map(range => {
                    const isSel = activePrice === range;
                    return (
                      <div
                        key={range}
                        onClick={() => setActivePrice(isSel ? '' : range)}
                        style={{
                          padding: '8px 10px', borderRadius: '10px', fontSize: '12.5px',
                          fontWeight: isSel ? 800 : 600,
                          color: isSel ? '#0071E3' : '#334155',
                          background: isSel ? '#EFF6FF' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{range}</span>
                        {isSel && <Check size={14} color="#0071E3" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}

          {/* ── PRODUCTS RESULTS SECTION ── */}
          <div style={{ flex: 1, width: '100%', minWidth: 0 }}>

            {/* Products Grid */}
            {filtered.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: isMobile ? '12px' : '16px',
                marginBottom: '32px'
              }}>
                {filtered.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badgeText={isTrendingQuery ? (idx % 2 === 0 ? 'Top Pick' : 'Best Seller') : undefined}
                    badgeColor={isTrendingQuery ? (idx % 2 === 0 ? '#34C759' : '#FF3B30') : '#FF3B30'}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
                padding: '48px 24px', textAlign: 'center', marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '42px', marginBottom: '14px' }}>🔍</div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                  No matching products found
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 20px 0', maxWidth: '340px', marginInline: 'auto' }}>
                  We couldn't find any products matching your selected filter criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: '#0071E3', color: '#FFFFFF', border: 'none',
                    borderRadius: '12px', padding: '12px 24px', fontSize: '13px',
                    fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,113,227,0.25)'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Responsive Premium Grabit Plus Banner */}
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0',
              padding: isMobile ? '20px 16px' : '24px 32px',
              display: 'flex', flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', justifyContent: 'space-between',
              gap: isMobile ? '16px' : '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textOverflow: 'ellipsis' }}>
                <img
                  src="/grabit-plus-rider.png"
                  alt="Grabit Plus Rider"
                  style={{ height: isMobile ? '75px' : '95px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0071E3', margin: 0 }}>
                      Grabit Plus
                    </h3>
                    <span style={{ background: '#34C759', color: '#FFFFFF', fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '10px' }}>
                      VIP
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#86868B', margin: 0, lineHeight: 1.4 }}>
                    Enjoy unlimited FREE deliveries &amp; exclusive discounts on all orders above ₹99.
                  </p>
                </div>
              </div>

              <button style={{
                background: '#0071E3', color: '#FFFFFF', border: 'none',
                borderRadius: '12px', padding: '12px 24px', fontSize: '13px',
                fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
                width: isMobile ? '100%' : 'auto', boxShadow: '0 4px 14px rgba(0,113,227,0.25)'
              }}>
                Join Grabit Plus →
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 📱 UNIVERSAL FILTER & SORT DRAWER MODAL (Portal to document.body) */}
      {isFilterModalOpen && createPortal(
        <div
          onClick={() => setIsFilterModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center', padding: isMobile ? 0 : '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: isMobile ? '24px 24px 0 0' : '24px',
              maxWidth: isMobile ? '100%' : '480px', width: '100%',
              minHeight: isMobile ? '85vh' : '580px',
              maxHeight: isMobile ? '92vh' : '90vh',
              overflowY: 'auto', padding: isMobile ? '20px 18px 28px' : '24px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #E5E5EA', paddingBottom: '14px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#1D1D1F', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.3px' }}>
                <SlidersHorizontal size={18} color="#0071E3" />
                <span>Filters &amp; Refine</span>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#F2F2F7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={15} color="#8E8E93" />
              </button>
            </div>

            {/* 1. Custom Inline Expandable Category Dropdown Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#1D1D1F', display: 'block', marginBottom: '8px' }}>
                Category
              </label>

              {/* Active Dropdown Header Pill */}
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                style={{
                  width: '100%', height: '46px', padding: '0 14px', borderRadius: '14px',
                  background: '#F2F2F7', border: '1.5px solid #E5E5EA',
                  fontSize: '13.5px', fontWeight: 800, color: '#1D1D1F',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span>{ALL_CATEGORIES_LIST.find(c => c.val === activeCat)?.icon || '🛍️'}</span>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {ALL_CATEGORIES_LIST.find(c => c.val === activeCat)?.name || 'All Categories'}
                  </span>
                </div>
                <ChevronDown size={17} color="#0071E3" style={{ transform: isCatDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {/* Custom Inline Options List */}
              {isCatDropdownOpen && (
                <div style={{
                  marginTop: '8px', background: '#F8FAFC', borderRadius: '16px',
                  border: '1px solid #E2E8F0', padding: '6px',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  transition: 'all 0.2s ease'
                }}>
                  {ALL_CATEGORIES_LIST.map(cat => {
                    const isSelected = activeCat === cat.val;
                    return (
                      <button
                        key={cat.val}
                        type="button"
                        onClick={() => {
                          setActiveCat(cat.val);
                          setActiveSubCat(cat.val);
                          setIsCatDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 14px', borderRadius: '10px',
                          fontSize: '13px', fontWeight: isSelected ? 900 : 600,
                          textAlign: 'left', border: 'none',
                          background: isSelected ? '#0071E3' : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#0F172A',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F1F5F9'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        {isSelected && <Check size={16} color="#FFFFFF" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Price Range (Clean Inline Pill Grid) */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#1D1D1F', display: 'block', marginBottom: '8px' }}>
                Price Range
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {['Under ₹50', '₹50 - ₹100', '₹100 - ₹200', 'Above ₹200'].map(range => {
                  const isSel = activePrice === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setActivePrice(isSel ? '' : range)}
                      style={{
                        padding: '10px 14px', borderRadius: '12px', fontSize: '12.5px',
                        fontWeight: isSel ? 800 : 600, textAlign: 'left',
                        background: isSel ? '#EFF6FF' : '#F2F2F7',
                        color: isSel ? '#0071E3' : '#1D1D1F',
                        border: isSel ? '1.5px solid #0071E3' : '1px solid #E5E5EA',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <span>{range}</span>
                      {isSel && <Check size={14} color="#0071E3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Apply & Clear Buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '14px', borderTop: '1px solid #E5E5EA' }}>
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: '#F2F2F7', color: '#FF3B30', border: 'none',
                  fontWeight: 800, fontSize: '13px', cursor: 'pointer'
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{
                  flex: 2, padding: '12px', borderRadius: '12px',
                  background: '#0071E3', color: '#FFFFFF', border: 'none',
                  fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,113,227,0.25)'
                }}
              >
                Apply ({filtered.length})
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
