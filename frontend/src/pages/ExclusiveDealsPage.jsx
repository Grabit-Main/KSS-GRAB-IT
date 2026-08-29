import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Tag, Sparkles, Clock, Percent, ShieldCheck, Flame, Gift, ArrowRight, ChevronRight, Star, Heart, Check, Filter, Search, Award } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ExclusiveDealsPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('discount');

  // Ticking Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products for Exclusive Deals (High discount items)
  const dealProducts = useMemo(() => {
    const extraDeals = [
      { id: 401, name: "Haldiram's Nagpur Aloo Bhujia 1kg Mega Saver Pack", weight: "1kg", price: 199, mrp: 350, discount: 43, rating: 4.9, reviews: 1890, image: "banner-exclusive-deals.png", category: "snacks", brand: "Haldiram's", inStock: true, stock_quantity: 50 },
      { id: 402, name: "Nescafe Classic Pure Instant Coffee 200g Glass Jar", weight: "200g", price: 420, mrp: 650, discount: 35, rating: 4.9, reviews: 2450, image: "banner-exclusive-deals.png", category: "tea-coffee", brand: "Nescafe", inStock: true, stock_quantity: 40 },
      { id: 403, name: "Dove Deeply Nourishing Body Lotion 400ml", weight: "400ml", price: 249, mrp: 499, discount: 50, rating: 4.8, reviews: 1620, image: "banner-exclusive-deals.png", category: "personal-care", brand: "Dove", inStock: true, stock_quantity: 60 },
      { id: 404, name: "Aashirvaad Select Premium Sharbati Atta 5kg", weight: "5kg", price: 285, mrp: 395, discount: 28, rating: 4.9, reviews: 3100, image: "banner-exclusive-deals.png", category: "staples", brand: "Aashirvaad", inStock: true, stock_quantity: 80 },
      { id: 405, name: "Kellogg's Real Honey Almond Corn Flakes 650g", weight: "650g", price: 235, mrp: 440, discount: 46, rating: 4.8, reviews: 940, image: "banner-exclusive-deals.png", category: "snacks", brand: "Kellogg's", inStock: true, stock_quantity: 45 },
      { id: 406, name: "Tata Sampann High Protein Unpolished Toor Dal 1kg", weight: "1kg", price: 145, mrp: 220, discount: 34, rating: 4.8, reviews: 1150, image: "banner-exclusive-deals.png", category: "staples", brand: "Tata Sampann", inStock: true, stock_quantity: 70 }
    ];

    const baseDeals = products.map(p => ({
      ...p,
      discount: p.discount || Math.min(60, Math.max(15, Math.round(((p.mrp - p.price) / p.mrp) * 100)))
    }));

    const combined = [...extraDeals, ...baseDeals];
    const unique = [];
    const seen = new Set();
    for (const item of combined) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }, []);

  const tabs = [
    { id: 'all', label: '🔥 All Mega Deals (Up to 60% OFF)' },
    { id: '60off', label: '⚡ 35% - 60% OFF Super Deals' },
    { id: 'snacks', label: '🍿 Snacks & Munchies' },
    { id: 'beverages', label: '🧃 Beverages & Coffee' },
    { id: 'staples', label: '🌾 Atta, Rice & Dals' },
    { id: 'personal-care', label: '💄 Personal Care & Lotion' }
  ];

  const filteredProducts = useMemo(() => {
    return dealProducts.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === 'all') return matchSearch;
      if (selectedTab === '60off') return matchSearch && p.discount >= 35;
      if (selectedTab === 'snacks') return matchSearch && (p.category === 'snacks' || p.category === 'biscuits' || p.category === 'chocolates');
      if (selectedTab === 'beverages') return matchSearch && (p.category === 'beverages' || p.category === 'tea-coffee');
      if (selectedTab === 'staples') return matchSearch && p.category === 'staples';
      if (selectedTab === 'personal-care') return matchSearch && p.category === 'personal-care';
      return matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'discount') return b.discount - a.discount;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [dealProducts, selectedTab, searchQuery, sortBy]);

  return (
    <div style={{ background: '#FAF9FF', color: '#1E1B4B', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* 🔮 Soft Purple Gradient Top Timer Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #6B21A8 0%, #7C3AED 50%, #8B5CF6 100%)',
        color: '#FFFFFF',
        padding: '10px 0',
        boxShadow: '0 4px 16px rgba(107, 33, 168, 0.15)'
      }}>
        <style>{`
          @keyframes floatAnim {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: isMobile ? '12px' : '14px', fontWeight: 800 }}>
            <span style={{
              background: '#FDE047', color: '#581C87', padding: '3px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              🔥 MEGA FLASH SALE
            </span>
            <span>EXCLUSIVE DEALS & OFFERS – UP TO 60% OFF!</span>
          </div>

          {/* Animated Ticking Countdown Timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
            <Clock size={16} color="#FDE047" />
            <span>Deals Expire In:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { val: String(timeLeft.hours).padStart(2, '0'), label: 'H' },
                { val: String(timeLeft.minutes).padStart(2, '0'), label: 'M' },
                { val: String(timeLeft.seconds).padStart(2, '0'), label: 'S' }
              ].map((t, i) => (
                <span key={i} style={{
                  background: '#FFFFFF',
                  color: '#6B21A8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #D8B4FE',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 900
                }}>
                  {t.val}{t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Breadcrumb Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E9D5FF', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
          <Link to="/" style={{ color: '#6B21A8', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Exclusive Deals & Offers</span>
        </div>
      </div>

      {/* 🚀 Main Hero Showcase Banner Card */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '20px' }}>
        <div style={{
          position: 'relative',
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          border: '1.5px solid #E9D5FF',
          boxShadow: '0 16px 40px rgba(107, 33, 168, 0.12)',
          background: '#FFFFFF'
        }}>
          {/* Main Commercial Banner Graphic */}
          <img
            src="/banner-exclusive-deals.png"
            alt="Exclusive Deals &amp; Offers - Up to 60% OFF"
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '340px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />

          {/* Floating Light Theme Glass Badge Overlay */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '12px' : '20px',
            right: isMobile ? '12px' : '24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #D8B4FE',
            borderRadius: '16px',
            padding: isMobile ? '8px 14px' : '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(107, 33, 168, 0.15)',
            animation: 'floatAnim 4s ease-in-out infinite'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6B21A8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Percent color="#FFFFFF" size={20} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#6B21A8', fontWeight: 800, textTransform: 'uppercase' }}>Limited Time</div>
              <div style={{ fontSize: isMobile ? '13px' : '16px', color: '#0F172A', fontWeight: 900 }}>FLAT 60% OFF</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎪 3 Light Theme Feature Promo Cards */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {/* Card 1: Midnight Flash */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1.5px solid #FECDD3',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)'
          }}>
            <span style={{ background: '#E11D48', color: '#FFFFFF', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ⚡ Midnight Flash
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#881337' }}>Flat 50% OFF Snacks</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#9F1239' }}>On Lays, Kurkure, Doritos & Pringles Cans.</p>
            <button onClick={() => setSelectedTab('snacks')} style={{
              background: '#E11D48', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
            }}>
              <span>Grab Deals</span> <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Weekend Grocery Fest */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1.5px solid #BFDBFE',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)'
          }}>
            <span style={{ background: '#2563EB', color: '#FFFFFF', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              🎁 Buy 2 Get 1 FREE
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#1E3A8A' }}>Grocery & Staples Fest</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#1E40AF' }}>Aashirvaad Atta, Tata Dal & Fortune Oil.</p>
            <button onClick={() => setSelectedTab('staples')} style={{
              background: '#2563EB', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <span>Shop Staples</span> <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Personal Care Super Sale */}
          <div style={{
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1.5px solid #DDD6FE',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.08)'
          }}>
            <span style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ✨ Min 40% OFF
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#4C1D95' }}>Body & Skincare Sale</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#5B21B6' }}>Dove Lotion, Dettol Soap & Nivea Care.</p>
            <button onClick={() => setSelectedTab('personal-care')} style={{
              background: '#7C3AED', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}>
              <span>Explore Care</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 🛍️ Main Deals Catalog & Filters Container */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: isMobile ? '16px' : '24px',
          border: '1.5px solid #E9D5FF',
          boxShadow: '0 10px 30px rgba(107, 33, 168, 0.06)',
          marginBottom: '28px'
        }}>
          {/* Section Header & Search/Sort Controls */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#4C1D95', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame color="#EA580C" size={26} />
                <span>Exclusive Discounted Products</span>
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                Showing {filteredProducts.length} high-discount items with up to 60% OFF!
              </p>
            </div>

            {/* Search & Sort */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '12px',
                    border: '1px solid #D8B4FE',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '12px',
                  border: '1px solid #D8B4FE',
                  background: '#FFFFFF',
                  color: '#6B21A8',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="discount">🔥 Highest Discount (%)</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Subcategory Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '24px',
                  border: selectedTab === tab.id ? '2px solid #7C3AED' : '1px solid #E9D5FF',
                  background: selectedTab === tab.id ? 'linear-gradient(135deg, #7C3AED 0%, #6B21A8 100%)' : '#F3E8FF',
                  color: selectedTab === tab.id ? '#FFFFFF' : '#5B21B6',
                  fontSize: '13px',
                  fontWeight: selectedTab === tab.id ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedTab === tab.id ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Discounted Products Grid */}
        {filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '20px'
          }}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                badge={`${product.discount}% OFF`}
                badgeColor="#E11D48"
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1.5px solid #E9D5FF'
          }}>
            <Gift size={54} color="#7C3AED" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#1F2937' }}>No deals found in this category</h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748B' }}>Try switching category filters or clearing your search term.</p>
            <button
              onClick={() => { setSelectedTab('all'); setSearchQuery(''); }}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6B21A8 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 🛡️ Light Theme Trust Badges Row */}
      <div className="container" style={{ marginTop: '48px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid #E9D5FF',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {[
            { title: "Best Prices Guaranteed", desc: "Unbeatable deals direct from brands" },
            { title: "100% Secure Payments", desc: "UPI, Cards, NetBanking & COD" },
            { title: "24/7 Customer Support", desc: "Instant assistance anytime" },
            { title: "Fast & Reliable Delivery", desc: "Express 10-minute doorstep drop" }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck color="#7C3AED" size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1F2937' }}>{item.title}</div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
