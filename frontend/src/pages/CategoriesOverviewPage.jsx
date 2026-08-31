import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Clock, ArrowRight } from 'lucide-react';
import ProductSvg from '../components/common/ProductSvg';
import { products } from '../data/products';
import { categories, getCanonicalSlug } from '../data/categories';
import useWindowWidth from '../hooks/useWindowWidth';

const CATEGORY_DETAILS = [
  {
    slug: 'produce',
    name: 'Fresh Fruits & Veggies',
    sub: 'Farm fresh fruits, organic veggies & eggs',
    group: 'fresh',
    badgeColor: '#16A34A',
    badgeBg: '#F0FDF4',
    accentColor: '#15803D',
    sla: '15 mins',
    tags: ['Fresh Fruits', 'Green Veggies', 'Organic Eggs'],
    icons: ['/fresh-produce-splash.jpg']
  },
  {
    slug: 'snacks-munchies',
    name: 'Snacks & Munchies',
    sub: "Lay's, Doritos, Bingo & crispy munchies",
    group: 'snacks',
    badgeColor: '#EA580C',
    badgeBg: '#FFF7ED',
    accentColor: '#C2410C',
    sla: '12 mins',
    tags: ['Potato Chips', 'Nachos', 'Namkeens'],
    icons: ['/category-snacks-banner.png']
  },
  {
    slug: 'dairy-bakery',
    name: 'Dairy & Bakery',
    sub: 'Amul butter, fresh milk, paneer & bread',
    group: 'fresh',
    badgeColor: '#0284C7',
    badgeBg: '#F0F9FF',
    accentColor: '#0369A1',
    sla: '15 mins',
    tags: ['Amul Milk', 'Butter & Ghee', 'Fresh Paneer'],
    icons: ['/amul-butter-real.jpg']
  },
  {
    slug: 'beverages',
    name: 'Cold Drinks & Juices',
    sub: 'Coca-Cola, Real juices & cold beverages',
    group: 'snacks',
    badgeColor: '#0D9488',
    badgeBg: '#F0FDFA',
    accentColor: '#0F766E',
    sla: '15 mins',
    tags: ['Soft Drinks', 'Fruit Juices', 'Energy Drinks'],
    icons: ['/coca-cola-real.jpg']
  },
  {
    slug: 'staples',
    name: 'Atta, Rice & Dal',
    sub: 'Aashirvaad wheat atta, rice & Tata pulses',
    group: 'staples',
    badgeColor: '#D97706',
    badgeBg: '#FFFBEB',
    accentColor: '#B45309',
    sla: '20 mins',
    tags: ['Chakki Atta', 'Basmati Rice', 'Moong Dal'],
    icons: ['/aashirvaad-atta-real.jpg']
  },
  {
    slug: 'chocolates',
    name: 'Chocolates & Sweets',
    sub: 'Cadbury Silk, Ferrero Rocher & sweets',
    group: 'snacks',
    badgeColor: '#9333EA',
    badgeBg: '#FAF5FF',
    accentColor: '#7E22CE',
    sla: '15 mins',
    tags: ['Cadbury Silk', 'Ferrero Rocher', 'Sweets'],
    icons: ['/cadbury-silk-real.jpg']
  },
  {
    slug: 'personal-care',
    name: 'Personal Care',
    sub: 'Dettol handwash, Dove soap & shampoos',
    group: 'care',
    badgeColor: '#0891B2',
    badgeBg: '#ECFEFF',
    accentColor: '#0E7490',
    sla: '20 mins',
    tags: ['Dettol Wash', 'Dove Soaps', 'Shampoos'],
    icons: ['/dettol-handwash-real.jpg']
  },
  {
    slug: 'household',
    name: 'Household Essentials',
    sub: 'Surf Excel, Vim gel & home cleaners',
    group: 'care',
    badgeColor: '#4F46E5',
    badgeBg: '#EEF2FF',
    accentColor: '#4338CA',
    sla: '20 mins',
    tags: ['Detergents', 'Dishwash Gels', 'Cleaners'],
    icons: ['/surf-excel-real.jpg']
  },
  {
    slug: 'tea-coffee',
    name: 'Tea, Coffee & Drinks',
    sub: 'Nescafe instant coffee, Tata tea & cocoa',
    group: 'snacks',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    accentColor: '#047857',
    sla: '15 mins',
    tags: ['Nescafe Coffee', 'Tata Tea', 'Green Tea'],
    icons: ['/nescafe-coffee-real.jpg']
  },
  {
    slug: 'biscuits',
    name: 'Biscuits & Cookies',
    sub: 'Oreo, Parle-G, Britannia cookies',
    group: 'snacks',
    badgeColor: '#CA8A04',
    badgeBg: '#FEFCE8',
    accentColor: '#A16207',
    sla: '15 mins',
    tags: ['Oreo Cookies', 'Parle-G', 'Wafers'],
    icons: ['/oreo-biscuits-real.jpg']
  },
  {
    slug: 'instant-food',
    name: 'Instant & Frozen Food',
    sub: 'Maggi 2-Min noodles, frozen snacks & soups',
    group: 'staples',
    badgeColor: '#EF4444',
    badgeBg: '#FEF2F2',
    accentColor: '#DC2626',
    sla: '10 mins',
    tags: ['Maggi Noodles', 'Frozen Snacks', 'Instant Soup'],
    icons: ['/maggi-noodles-real.jpg']
  },
  {
    slug: 'oil',
    name: 'Edible Oils & Ghee',
    sub: 'Fortune sunflower oil & pure Desi ghee',
    group: 'staples',
    badgeColor: '#EAB308',
    badgeBg: '#FEF08A20',
    accentColor: '#854D0E',
    sla: '20 mins',
    tags: ['Sunflower Oil', 'Mustard Oil', 'Desi Ghee'],
    icons: ['/fortune-oil-real.jpg']
  },
  {
    slug: 'electronics',
    name: 'Electronics & Gadgets',
    sub: 'Bluetooth earphones, smartwatches & accessories',
    group: 'lifestyle',
    badgeColor: '#F97316',
    badgeBg: '#FFF7ED',
    accentColor: '#C2410C',
    sla: '20 mins',
    tags: ['Earphones', 'Smartwatches', 'Audio'],
    icons: ['/electronics-hero-banner.jpg']
  },
  {
    slug: 'fashion',
    name: 'Fashion & Accessories',
    sub: 'Sneakers, watches & stylish accessories',
    group: 'lifestyle',
    badgeColor: '#DB2777',
    badgeBg: '#FDF2F8',
    accentColor: '#BE185D',
    sla: '25 mins',
    tags: ['Sneakers', 'Sunglasses', 'Accessories'],
    icons: ['/sneakers.jpg']
  }
];

export default function CategoriesOverviewPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  const [activeGroup, setActiveGroup] = useState('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [liveCategories, setLiveCategories] = useState(() => [...categories]);

  useEffect(() => {
    const handleSync = () => setLiveCategories([...categories]);
    handleSync();
    window.addEventListener('grabit_categories_synced', handleSync);
    window.addEventListener('grabit_categories_updated', handleSync);
    return () => {
      window.removeEventListener('grabit_categories_synced', handleSync);
      window.removeEventListener('grabit_categories_updated', handleSync);
    };
  }, []);

  const OBSOLETE_NAMES = new Set([
    'bakery & breads',
    'beverages & drinks',
    'dairy & breakfast',
    'fruits & vegetables',
    'gourmet organic sweets',
    'gourmet organic...'
  ]);

  const mergedCategories = useMemo(() => {
    const customList = liveCategories
      .filter((c) => {
        const nameLower = String(c.name || '').toLowerCase().trim();
        if (OBSOLETE_NAMES.has(nameLower)) return false;
        return !CATEGORY_DETAILS.some((cd) => cd.slug === c.slug || String(cd.name).toLowerCase().trim() === nameLower);
      })
      .map((c) => ({
        slug: getCanonicalSlug(c.slug || c.name),
        name: c.name,
        sub: `${c.name} quick-commerce essentials`,
        group: 'lifestyle',
        badgeColor: '#0071E3',
        badgeBg: '#EFF6FF',
        accentColor: '#0071E3',
        sla: '15 mins',
        tags: [c.name, 'Essentials'],
        icons: [c.image || c.image_url || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png'],
      }));
    return [...CATEGORY_DETAILS, ...customList];
  }, [liveCategories]);

  const filteredCategories = mergedCategories.filter(cat => {
    if (activeGroup !== 'all' && cat.group !== activeGroup) return false;
    if (filterQuery.trim() && !cat.name.toLowerCase().includes(filterQuery.toLowerCase()) && !cat.sub.toLowerCase().includes(filterQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', padding: isMobile ? '20px 10px 90px' : '24px 24px 60px' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* 👑 HIGH-RES COMMERCIAL HERO BANNER CARD WITH EMBEDDED SEARCH BAR */}
        <div style={{
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          border: '1.5px solid #BFDBFE',
          boxShadow: '0 16px 40px rgba(0, 113, 227, 0.12)',
          background: '#FFFFFF',
          marginBottom: isMobile ? '20px' : '28px',
          position: 'relative'
        }}>
          {/* Main 3D Commercial Banner Graphic */}
          <div style={{ position: 'relative', width: '100%' }}>
            <img
              src="/banner-all-categories.png"
              alt="All Categories - Explore 278+ Daily Groceries, Fresh Produce, Cold Beverages, Electronics & Essentials"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />

            {/* Overlay Search Bar Centered Directly Inside the Light Blue Bottom Area */}
            <div style={{
              position: 'absolute',
              bottom: isMobile ? '10%' : '14%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '90%' : '82%',
              maxWidth: '560px',
              zIndex: 10
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                boxShadow: '0 10px 30px rgba(0, 113, 227, 0.22), 0 0 0 1px rgba(255,255,255,0.8)',
                borderRadius: '16px'
              }}>
                <Search size={19} color="#0071E3" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search categories (e.g. Snacks, Milk, Dairy)..."
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px 14px 12px 48px' : '15px 18px 15px 52px',
                    borderRadius: '16px',
                    border: '2px solid #3B82F6',
                    background: '#FFFFFF',
                    fontSize: isMobile ? '13.5px' : '15px',
                    color: '#0F172A',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 📱 ZEPTO-STYLE NATIVE MOBILE & DESKTOP GRID */}
        <div key={activeGroup} className="category-transition-container" style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '8px' : '20px'
        }}>
          {filteredCategories.map(cat => {
            const catItems = products.filter(p => p.category === cat.slug || (cat.slug === 'produce' && p.category === 'produce'));
            const count = catItems.length > 0 ? catItems.length : 24;

            {/* MOBILE COMPACT TILE CARD DESIGN */}
            if (isMobile) {
              return (
                <Link
                  key={`${cat.slug}-${cat.name}`}
                  to={`/category/${cat.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justify: 'space-between',
                    textDecoration: 'none',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '10px 6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    textAlign: 'center',
                    minHeight: '115px'
                  }}
                >
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: cat.badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    marginBottom: '6px',
                    overflow: 'hidden',
                    border: `1px solid ${cat.badgeColor}20`
                  }}>
                    {cat.icons && cat.icons[0] && cat.icons[0].startsWith('/') ? (
                      <img src={cat.icons[0]} alt={cat.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                    ) : (
                      <ProductSvg name={cat.icons[0]} size={36} />
                    )}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cat.name}
                  </span>
                </Link>
              );
            }

            {/* DESKTOP / TABLET PREMIUM CARD DESIGN */}
            return (
              <Link
                key={`${cat.slug}-${cat.name}`}
                to={`/category/${cat.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '20px',
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = cat.badgeColor;
                  e.currentTarget.style.boxShadow = `0 12px 28px ${cat.badgeColor}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: cat.badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    border: `1px solid ${cat.badgeColor}25`
                  }}>
                    {cat.icons && cat.icons[0] && cat.icons[0].startsWith('/') ? (
                      <img src={cat.icons[0]} alt={cat.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                    ) : (
                      <ProductSvg name={cat.icons[0]} size={42} />
                    )}
                  </div>
                  <span style={{
                    background: cat.badgeBg,
                    color: cat.badgeColor,
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${cat.badgeColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} /> {cat.sla}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  {cat.name}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#64748B', lineHeight: 1.35, height: '34px', overflow: 'hidden' }}>
                  {cat.sub}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: cat.badgeColor }}>
                    Explore Category
                  </span>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: cat.badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    color: cat.badgeColor
                  }}>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
