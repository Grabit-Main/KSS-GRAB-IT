import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronRight, Gift } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ExclusiveDealsPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;
  const [selectedCategory, setSelectedCategory] = useState('all');

  // High discount products catalog
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

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return dealProducts;
    if (selectedCategory === 'snacks') return dealProducts.filter(p => p.category === 'snacks' || p.category === 'biscuits' || p.category === 'chocolates');
    if (selectedCategory === 'staples') return dealProducts.filter(p => p.category === 'staples');
    if (selectedCategory === 'personal-care') return dealProducts.filter(p => p.category === 'personal-care');
    return dealProducts;
  }, [dealProducts, selectedCategory]);

  return (
    <div style={{ background: '#FAF9FF', color: '#1E1B4B', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Professional Header Bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E9D5FF',
        padding: isMobile ? '12px 0' : '14px 0',
        boxShadow: '0 2px 12px rgba(107, 33, 168, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Back Arrow + Professional Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/" aria-label="Back to Store" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '38px', height: '38px', borderRadius: '12px',
              background: '#F3E8FF', color: '#6B21A8',
              textDecoration: 'none', transition: 'all 0.2s ease',
              border: '1px solid #E9D5FF',
              boxShadow: '0 2px 8px rgba(107, 33, 168, 0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E9D5FF'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F3E8FF'; e.currentTarget.style.transform = 'none'; }}
            >
              <ArrowLeft size={20} color="#6B21A8" />
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: 900,
                color: '#1E1B4B',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}>
                Exclusive Deals & Offers
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                Handpicked premium discounts & daily savings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Hero Commercial Banner Card */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '20px' }}>
        <div style={{
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          border: '1.5px solid #E9D5FF',
          boxShadow: '0 16px 40px rgba(107, 33, 168, 0.12)',
          background: '#FFFFFF'
        }}>
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
        </div>
      </div>

      {/* 3 Light Theme Feature Promo Cards */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px' }}>
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
            <button onClick={() => setSelectedCategory('snacks')} style={{
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
            <button onClick={() => setSelectedCategory('staples')} style={{
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
            <button onClick={() => setSelectedCategory('personal-care')} style={{
              background: '#7C3AED', color: '#FFFFFF', border: 'none', padding: '8px 18px', borderRadius: '10px',
              fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
            }}>
              <span>Explore Care</span> <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Direct Discounted Products Grid */}
      <div className="container" style={{ marginTop: '28px' }}>
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
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#1F2937' }}>No deals found</h3>
            <button
              onClick={() => setSelectedCategory('all')}
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
              Show All Deals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
