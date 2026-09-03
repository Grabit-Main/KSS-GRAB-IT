import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShoppingBag, Flame, Gift, Clock, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

const FESTIVE_CATEGORIES = [
  { id: 'all', name: '✨ All Festive Specials', icon: '✨' },
  { id: 'sweets', name: '🍫 Sweets & Chocolates', icon: '🍫' },
  { id: 'pooja', name: '🪔 Pooja & Diya Needs', icon: '🪔' },
  { id: 'snacks', name: '🍿 Festive Munchies', icon: '🍿' },
  { id: 'beverages', name: '🥤 Festive Drinks & Juices', icon: '🥤' }
];

const FESTIVE_COUPONS = [
  { code: 'DIWALI100', title: 'Flat ₹100 OFF', desc: 'On festive orders above ₹499', badge: 'DIWALI SPECIAL' },
  { code: 'MITHAI50', title: 'Flat ₹50 OFF', desc: 'On sweets & chocolates above ₹249', badge: 'SWEET TOOTH' },
  { code: 'FREESHIP', title: 'Free Express Delivery', desc: 'Enjoy zero delivery fee across town', badge: 'LIMITED TIME' }
];

export default function DiwaliBannerPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const [selectedCat, setSelectedCat] = useState('all');

  // Filter products for the festive store
  const festiveProducts = useMemo(() => {
    return products.filter(p => {
      const cat = String(p.category || p.category_slug || '').toLowerCase();
      const name = String(p.name || '').toLowerCase();
      if (selectedCat === 'sweets') {
        return cat.includes('chocolates') || cat.includes('sweet') || name.includes('sweet') || name.includes('ladoo') || name.includes('barfi') || name.includes('chocolate') || name.includes('silk') || name.includes('mithai');
      }
      if (selectedCat === 'pooja') {
        return cat.includes('pooja') || name.includes('ghee') || name.includes('agarbatti') || name.includes('diya') || name.includes('camphor') || name.includes('oil');
      }
      if (selectedCat === 'snacks') {
        return cat.includes('snacks') || name.includes('namkeen') || name.includes('biscuit') || name.includes('cookies') || name.includes('chips');
      }
      if (selectedCat === 'beverages') {
        return cat.includes('beverages') || name.includes('juice') || name.includes('drink') || name.includes('sparkling');
      }
      // 'all' category returns combined festive selection
      return (
        cat.includes('chocolates') ||
        cat.includes('sweet') ||
        cat.includes('pooja') ||
        name.includes('ghee') ||
        name.includes('silk') ||
        name.includes('ladoo') ||
        (p.rating && p.rating >= 4.7)
      );
    });
  }, [selectedCat]);

  return (
    <div style={{ background: '#120205', minHeight: '100vh', color: '#FFFFFF', paddingBottom: '80px' }}>
      
      {/* 🌟 FESTIVE TOP NAVIGATION BAR */}
      <header style={{
        background: 'rgba(28, 5, 8, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 0'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            to="/"
            style={{
              color: '#FDE047',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={18} />
            <span>Back to GrabIt</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
              color: '#280106',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.35)'
            }}>
              <Flame size={13} fill="#280106" /> DIWALI MAHOTSAV 2026
            </span>
          </div>
        </div>
      </header>

      {/* 🪔 GRAND FESTIVE HERO BANNER */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #2A040A 0%, #170205 100%)',
        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
        padding: isMobile ? '24px 16px 28px' : '40px 24px 44px',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(253, 224, 71, 0.12)',
            border: '1px solid rgba(253, 224, 71, 0.3)',
            color: '#FDE047',
            padding: '6px 16px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            <Sparkles size={15} color="#FDE047" />
            <span>FESTIVAL OF LIGHTS • INSTANT DELIVERY IN 10 MINUTES</span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '28px' : '44px',
            fontWeight: 900,
            color: '#FFD700',
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(255, 215, 0, 0.35)'
          }}>
            🪔 GrabIt Diwali Grand Bazaar
          </h1>

          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            color: '#F1E5D1',
            maxWidth: '680px',
            margin: '0 auto 24px',
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            Celebrate Diwali with freshness and joy! Order premium mithai, gift hampers, pure cow ghee, brass diyas, and festive snacks delivered to your doorstep in 10-15 minutes.
          </p>

          {/* Animated Hero Banner Illustration */}
          <div style={{
            maxWidth: '960px',
            margin: '0 auto 28px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.8), 0 0 30px rgba(212, 175, 55, 0.25)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            background: '#280106'
          }}>
            <img
              src="/diwali-banner-grabit.svg"
              alt="Grabit Diwali Celebrations"
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
            />
          </div>

          {/* Trust Value Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '12px',
            maxWidth: '960px',
            margin: '0 auto'
          }}>
            {[
              { icon: <Clock size={16} color="#FDE047" />, title: '10-15 Min Delivery', desc: 'Fast express riders' },
              { icon: <Gift size={16} color="#FDE047" />, title: 'Festive Hampers', desc: 'Handcrafted gift sets' },
              { icon: <ShieldCheck size={16} color="#FDE047" />, title: '100% Pure & Fresh', desc: 'Certified sweets & ghee' },
              { icon: <Flame size={16} color="#FDE047" />, title: 'Pooja Essentials', desc: 'Brass diyas & batti' },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(253, 224, 71, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>{b.title}</div>
                  <div style={{ fontSize: '11px', color: '#A1A1AA' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🏷️ EXCLUSIVE FESTIVE COUPONS STRIP */}
      <section style={{ padding: '24px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {FESTIVE_COUPONS.map((c) => (
              <div
                key={c.code}
                style={{
                  background: 'linear-gradient(135deg, rgba(42, 4, 10, 0.8) 0%, rgba(20, 2, 5, 0.9) 100%)',
                  border: '1px dashed rgba(212, 175, 55, 0.6)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}
              >
                <div>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: '#FDE047',
                    background: 'rgba(253, 224, 71, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.4px'
                  }}>
                    {c.badge}
                  </span>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                    {c.desc}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#FDE047', fontWeight: 800 }}>CODE</div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 900, letterSpacing: '1px' }}>
                    {c.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛍️ FESTIVE PRODUCT CATALOG SHOWCASE */}
      <main className="container" style={{ maxWidth: '1200px', margin: '32px auto 0', padding: '0 16px' }}>
        
        {/* Category Pills Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          marginBottom: '24px'
        }}>
          {FESTIVE_CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#280106' : '#F1E5D1',
                  border: isSelected ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '24px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 900 : 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 16px rgba(212, 175, 55, 0.4)' : 'none'
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Catalog Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFD700', margin: '0 0 4px' }}>
              {FESTIVE_CATEGORIES.find(c => c.id === selectedCat)?.name || 'Festive Specials'}
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
              Showing {festiveProducts.length} festive curated items ready for 10-minute delivery
            </p>
          </div>
          <Link
            to="/category/chocolates"
            style={{
              color: '#FDE047',
              fontSize: '13px',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            Explore All Sweets →
          </Link>
        </div>

        {/* Festive Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: isMobile ? '12px' : '18px',
          marginBottom: '48px'
        }}>
          {festiveProducts.map((p) => (
            <div key={p.id} style={{ background: '#FFFFFF', borderRadius: '18px', overflow: 'hidden', color: '#111827' }}>
              <ProductCard
                product={p}
                badgeText="Diwali Special"
                badgeColor="#D97706"
              />
            </div>
          ))}
        </div>

        {/* CTA Bottom Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #2D080D 0%, #150204 100%)',
          border: '2px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '24px',
          padding: isMobile ? '28px 20px' : '36px 40px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 900, color: '#FFD700', margin: '0 0 8px' }}>
            Sending Diwali Gifts to Loved Ones?
          </h3>
          <p style={{ fontSize: '14px', color: '#E2E8F0', maxWidth: '580px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Deliver sweets, dry fruits, chocolates, and diyas directly to your friends and family with our express 10-minute delivery network.
          </p>
          <Link
            to="/"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
              color: '#280106',
              padding: '13px 32px',
              borderRadius: '28px',
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)'
            }}
          >
            <ShoppingBag size={18} />
            <span>Continue Shopping on GrabIt</span>
          </Link>
        </div>

      </main>

    </div>
  );
}
