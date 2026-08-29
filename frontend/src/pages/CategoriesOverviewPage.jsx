import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Zap, Search, ShieldCheck, Clock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    sub: 'Lay\'s, Doritos, Bingo & crispy munchies',
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
        


        {/* 👑 HEADER BANNER CARD WITH MATCHING ROYAL BLUE & ICE BLUE GRADIENT */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 45%, #DBEAFE 100%)',
          borderRadius: isMobile ? '20px' : '28px',
          border: '1.5px solid #BFDBFE',
          padding: isMobile ? '20px 16px' : '36px 44px',
          marginBottom: isMobile ? '20px' : '28px',
          boxShadow: '0 12px 36px rgba(0, 113, 227, 0.08)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexDirection: isMobile ? 'column-reverse' : 'row', gap: '20px',
            marginBottom: '16px'
          }}>
            {/* Left Content Column */}
            <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
              <h1 style={{ fontSize: isMobile ? '24px' : '38px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                All Categories
              </h1>
              
              <p style={{ fontSize: isMobile ? '13px' : '14.5px', color: '#475569', margin: '0 0 18px', fontWeight: 500, lineHeight: 1.45 }}>
                Explore 278+ daily groceries, fresh produce, cold beverages, electronics &amp; essentials
              </p>

              {/* Instant Category Filter Search */}
              <div style={{ position: 'relative', maxWidth: '420px', width: '100%' }}>
                <Search size={17} color="#0071E3" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search categories (e.g. Snacks, Milk)..."
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px', borderRadius: '14px',
                    border: '1.5px solid #BFDBFE', background: '#FFFFFF',
                    fontSize: '13.5px', color: '#0F172A', outline: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Right Hero Image Column (Clean Isolated Tote Bag on 100% Transparent Background) */}
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: isMobile ? '100%' : 'auto'
            }}>
              <img
                src="/grabit-all-categories-hero-transparent.png"
                alt="All Grabit Categories Hero"
                style={{
                  height: isMobile ? '170px' : '230px', width: 'auto', maxWidth: isMobile ? '100%' : '400px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 32px rgba(0, 113, 227, 0.2))',
                  transition: 'transform 0.3s ease'
                }}
              />
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
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '10px 8px',
                    textDecoration: 'none',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'space-between',
                    textAlign: 'center',
                    minHeight: '135px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  {/* Center Graphic */}
                  <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: '4px', margin: '8px 0'
                  }}>
                    <ProductSvg name={cat.icons[0]} s={46} />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 style={{
                      fontSize: '12px', fontWeight: 800, color: '#0F172A',
                      lineHeight: 1.2, margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              );
            }

            {/* DESKTOP PREMIUM STORE CARD DESIGN */}
            return (
              <div
                key={`${cat.slug}-${cat.name}`}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = cat.badgeColor;
                  e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,0.08)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                }}
              >
                <div>

                  <Link to={`/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, margin: '0 0 4px' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: 500, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.sub}
                    </p>
                  </Link>
                </div>

                <Link to={`/category/${cat.slug}`} style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: '8px', margin: '14px 0', textDecoration: 'none',
                  background: 'radial-gradient(circle, #F8FAFC 0%, rgba(255,255,255,0) 70%)',
                  padding: '10px 0', borderRadius: '16px'
                }}>
                  {cat.icons.map((ic, i) => (
                    <div key={i} style={{
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.14))',
                      transform: i === 1 ? 'scale(0.88) translateY(4px)' : 'none'
                    }}>
                      <ProductSvg name={ic} s={64} />
                    </div>
                  ))}
                </Link>

                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {cat.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{ background: '#F1F5F9', color: '#475569', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/category/${cat.slug}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#F8FAFC', color: '#0F172A',
                      padding: '8px 12px', borderRadius: '10px',
                      fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                      border: '1px solid #E2E8F0', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = cat.badgeColor;
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = cat.badgeColor;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.color = '#0F172A';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <span>Browse Category</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
