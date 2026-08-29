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

  // Animated Countdown Timer (Hours, Minutes, Seconds)
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

  // Filter products for Exclusive Deals (High discount items 15%+ to 60%)
  const dealProducts = useMemo(() => {
    // Add extra high-discount curated items for Exclusive Deals page
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
    { id: '60off', label: '⚡ 50% - 60% OFF Super Deals' },
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
    <div style={{ background: '#0F0728', color: '#FFFFFF', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* 🔮 Animated Neon Top Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #6D28D9 0%, #4C1D95 40%, #8B5CF6 70%, #6D28D9 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 6s ease infinite',
        padding: '10px 0',
        borderBottom: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 4px 20px rgba(109, 40, 217, 0.5)'
      }}>
        <style>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulseGlow {
            0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.6)); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 25px rgba(236,72,153,0.9)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.6)); }
          }
          @keyframes floatAnim {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          @keyframes shimmerGlow {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}</style>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: isMobile ? '12px' : '14px', fontWeight: 800 }}>
            <span style={{
              background: '#F59E0B', color: '#0F0728', padding: '3px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              🔥 MEGA FLASH SALE
            </span>
            <span>EXCLUSIVE DEALS & OFFERS – UP TO 60% OFF!</span>
          </div>

          {/* Animated Countdown Timer */}
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
                  background: 'rgba(15, 7, 40, 0.85)',
                  color: '#FDE047',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(253, 224, 71, 0.4)',
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

      {/* 🧭 Breadcrumb Navigation */}
      <div className="container" style={{ paddingTop: '16px', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#A78BFA' }}>
          <Link to="/" style={{ color: '#C4B5FD', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={14} color="#7C3AED" />
          <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Exclusive Deals & Offers</span>
        </div>
      </div>

      {/* 🚀 Main Animated Hero Showcase Banner */}
      <div className="container" style={{ marginTop: '12px' }}>
        <div style={{
          position: 'relative',
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          border: '2px solid rgba(168, 85, 247, 0.4)',
          boxShadow: '0 20px 60px rgba(109, 40, 217, 0.4)',
          background: 'linear-gradient(135deg, #1E0B4B 0%, #2E1065 50%, #4C1D95 100%)',
          animation: 'pulseGlow 8s ease-in-out infinite'
        }}>
          {/* Main Clean Banner Graphic */}
          <img
            src="/banner-exclusive-deals.png"
            alt="Exclusive Deals & Offers - Up to 60% OFF"
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '360px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />

          {/* Floating Neon Badge overlay */}
          <div style={{
            position: 'absolute',
            top: isMobile ? '12px' : '24px',
            right: isMobile ? '12px' : '24px',
            background: 'rgba(15, 7, 40, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(236, 72, 153, 0.6)',
            borderRadius: '16px',
            padding: isMobile ? '8px 14px' : '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)',
            animation: 'floatAnim 4s ease-in-out infinite'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Percent color="#FFFFFF" size={20} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#F472B6', fontWeight: 800, textTransform: 'uppercase' }}>Limited Time</div>
              <div style={{ fontSize: isMobile ? '13px' : '16px', color: '#FFFFFF', fontWeight: 900 }}>FLAT 60% OFF</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎪 3 Animated Promo Feature Banners Grid */}
      <div className="container" style={{ marginTop: isMobile ? '20px' : '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {/* Banner 1: Midnight Flash */}
          <div style={{
            background: 'linear-gradient(135deg, #831843 0%, #9D174D 50%, #BE185D 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(244, 114, 182, 0.3)',
            boxShadow: '0 10px 30px rgba(157, 23, 77, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
            }} />
            <span style={{ background: '#F43F5E', color: '#FFF', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ⚡ Midnight Flash
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>Flat 50% OFF Snacks</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#FBCFE8' }}>On Lays, Kurkure, Doritos & Pringles Cans.</p>
            <button onClick={() => setSelectedTab('snacks')} style={{
              background: '#FFFFFF', color: '#831843', border: 'none', padding: '7px 16px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}>
              <span>Grab Deals</span> <ArrowRight size={14} />
            </button>
          </div>

          {/* Banner 2: Weekend Grocery Fest */}
          <div style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #3B82F6 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(147, 197, 253, 0.3)',
            boxShadow: '0 10px 30px rgba(29, 78, 216, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
            }} />
            <span style={{ background: '#60A5FA', color: '#1E3A8A', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              🎁 Buy 2 Get 1 FREE
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>Grocery & Staples Fest</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#DBEAFE' }}>Aashirvaad Atta, Tata Dal & Fortune Oil.</p>
            <button onClick={() => setSelectedTab('staples')} style={{
              background: '#FFFFFF', color: '#1E3A8A', border: 'none', padding: '7px 16px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}>
              <span>Shop Staples</span> <ArrowRight size={14} />
            </button>
          </div>

          {/* Banner 3: Personal Care Super Sale */}
          <div style={{
            background: 'linear-gradient(135deg, #581C87 0%, #7E22CE 50%, #A855F7 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(216, 180, 254, 0.3)',
            boxShadow: '0 10px 30px rgba(126, 34, 206, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', height: '100px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
            }} />
            <span style={{ background: '#C084FC', color: '#3B0764', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ✨ Min 40% OFF
            </span>
            <h3 style={{ margin: '10px 0 6px', fontSize: '18px', fontWeight: 900, color: '#FFFFFF' }}>Body & Skincare Sale</h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#F3E8FF' }}>Dove Lotion, Dettol Soap & Nivea Care.</p>
            <button onClick={() => setSelectedTab('personal-care')} style={{
              background: '#FFFFFF', color: '#581C87', border: 'none', padding: '7px 16px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}>
              <span>Explore Care</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 🛍️ Main Deals Catalog & Filters */}
      <div className="container" style={{ marginTop: '36px' }}>
        <div style={{
          background: 'rgba(30, 15, 75, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: isMobile ? '16px' : '24px',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          marginBottom: '28px'
        }}>
          {/* Section Title & Controls */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Flame color="#F59E0B" size={28} />
                <span>Exclusive Discounted Products</span>
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#C4B5FD' }}>
                Showing {filteredProducts.length} high-discount items with up to 60% OFF!
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} color="#A78BFA" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    background: 'rgba(15, 7, 40, 0.7)',
                    color: '#FFFFFF',
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
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  background: 'rgba(15, 7, 40, 0.9)',
                  color: '#FDE047',
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

          {/* Interactive Category Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '24px',
                  border: selectedTab === tab.id ? '2px solid #EC4899' : '1px solid rgba(139, 92, 246, 0.3)',
                  background: selectedTab === tab.id ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'rgba(15, 7, 40, 0.6)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: selectedTab === tab.id ? 800 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedTab === tab.id ? '0 4px 16px rgba(236, 72, 153, 0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Discounted Product Cards Grid */}
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
                badgeColor="#EC4899"
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(30, 15, 75, 0.6)',
            borderRadius: '20px',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <Gift size={54} color="#A78BFA" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#FFFFFF' }}>No deals found in this category</h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#C4B5FD' }}>Try switching category filters or clearing your search term.</p>
            <button
              onClick={() => { setSelectedTab('all'); setSearchQuery(''); }}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
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

      {/* 🛡️ Trust & Safety Badges */}
      <div className="container" style={{ marginTop: '48px' }}>
        <div style={{
          background: 'rgba(30, 15, 75, 0.5)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
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
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck color="#A78BFA" size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
