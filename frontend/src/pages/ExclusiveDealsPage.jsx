import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ExclusiveDealsPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  // 🍿 1. Snacks & Munchies Deals
  const snackProducts = useMemo(() => {
    const custom = [
      { id: 401, name: "Haldiram's Nagpur Aloo Bhujia 1kg Mega Saver Pack", weight: "1kg", price: 199, mrp: 350, discount: 43, rating: 4.9, reviews: 1890, image: "banner-exclusive-deals.png", category: "snacks", brand: "Haldiram's", inStock: true, stock_quantity: 50 },
      { id: 405, name: "Kellogg's Real Honey Almond Corn Flakes 650g", weight: "650g", price: 235, mrp: 440, discount: 46, rating: 4.8, reviews: 940, image: "banner-exclusive-deals.png", category: "snacks", brand: "Kellogg's", inStock: true, stock_quantity: 45 },
      { id: 407, name: "Lay's India's Magic Masala Potato Chips 115g Pack of 2", weight: "230g", price: 70, mrp: 100, discount: 30, rating: 4.8, reviews: 820, image: "banner-exclusive-deals.png", category: "snacks", brand: "Lay's", inStock: true, stock_quantity: 60 },
      { id: 408, name: "Pringles Sour Cream & Onion Potato Chips Can 110g", weight: "110g", price: 85, mrp: 140, discount: 39, rating: 4.9, reviews: 1240, image: "banner-exclusive-deals.png", category: "snacks", brand: "Pringles", inStock: true, stock_quantity: 40 }
    ];
    const base = products.filter(p => p.category === 'snacks' || p.category === 'biscuits' || p.category === 'chocolates').map(p => ({
      ...p, discount: p.discount || 50
    }));
    return [...custom, ...base];
  }, []);

  // 🌾 2. Grocery & Staples Products
  const groceryProducts = useMemo(() => {
    const custom = [
      { id: 404, name: "Aashirvaad Select Premium Sharbati Atta 5kg", weight: "5kg", price: 285, mrp: 395, discount: 28, rating: 4.9, reviews: 3100, image: "banner-exclusive-deals.png", category: "staples", brand: "Aashirvaad", inStock: true, stock_quantity: 80 },
      { id: 406, name: "Tata Sampann High Protein Unpolished Toor Dal 1kg", weight: "1kg", price: 145, mrp: 220, discount: 34, rating: 4.8, reviews: 1150, image: "banner-exclusive-deals.png", category: "staples", brand: "Tata Sampann", inStock: true, stock_quantity: 70 },
      { id: 409, name: "Fortune Sunlite Refined Sunflower Oil 5L Jar", weight: "5L", price: 620, mrp: 850, discount: 27, rating: 4.9, reviews: 2100, image: "banner-exclusive-deals.png", category: "staples", brand: "Fortune", inStock: true, stock_quantity: 55 },
      { id: 410, name: "India Gate Super Premium Basmati Rice 5kg", weight: "5kg", price: 540, mrp: 780, discount: 31, rating: 4.9, reviews: 1950, image: "banner-exclusive-deals.png", category: "staples", brand: "India Gate", inStock: true, stock_quantity: 45 }
    ];
    const base = products.filter(p => p.category === 'staples' || p.category === 'dairy-bread').map(p => ({
      ...p, discount: p.discount || 30
    }));
    return [...custom, ...base];
  }, []);

  // 💄 3. Body & Skincare Products
  const skincareProducts = useMemo(() => {
    const custom = [
      { id: 403, name: "Dove Deeply Nourishing Body Lotion 400ml", weight: "400ml", price: 249, mrp: 499, discount: 50, rating: 4.8, reviews: 1620, image: "banner-exclusive-deals.png", category: "personal-care", brand: "Dove", inStock: true, stock_quantity: 60 },
      { id: 411, name: "Dettol Original Germ Protection Soap 125g Pack of 5", weight: "625g", price: 195, mrp: 325, discount: 40, rating: 4.9, reviews: 2800, image: "banner-exclusive-deals.png", category: "personal-care", brand: "Dettol", inStock: true, stock_quantity: 90 },
      { id: 412, name: "Nivea Soft Light Moisturizing Cream 300ml Jar", weight: "300ml", price: 245, mrp: 450, discount: 45, rating: 4.9, reviews: 1540, image: "banner-exclusive-deals.png", category: "personal-care", brand: "Nivea", inStock: true, stock_quantity: 50 },
      { id: 413, name: "Himalaya Purifying Neem Face Wash 200ml Gel", weight: "200ml", price: 149, mrp: 240, discount: 38, rating: 4.8, reviews: 1120, image: "banner-exclusive-deals.png", category: "personal-care", brand: "Himalaya", inStock: true, stock_quantity: 65 }
    ];
    const base = products.filter(p => p.category === 'personal-care').map(p => ({
      ...p, discount: p.discount || 40
    }));
    return [...custom, ...base];
  }, []);

  return (
    <div style={{ background: '#FAF9FF', color: '#1E1B4B', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header Bar */}
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

      {/* 🍿 SECTION 1: SNACKS & MUNCHIES (WITH BANNER DIRECTLY ABOVE) */}
      <div id="snacks-section" className="container" style={{ marginTop: isMobile ? '20px' : '28px' }}>
        {/* Banner 1: Midnight Flash */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid #FECDD3',
          boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: '#E11D48', color: '#FFFFFF', fontSize: '11px', fontWeight: 900, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ⚡ Midnight Flash Sale
            </span>
            <h2 style={{ margin: '10px 0 4px', fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#881337' }}>
              Flat 50% OFF Snacks & Munchies
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#9F1239' }}>
              Instant savings on Lay's, Kurkure, Doritos, Pringles, Kellogg's & Cadbury chocolates!
            </p>
          </div>
          <span style={{ background: '#FFE4E6', color: '#BE185D', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
            🍿 {snackProducts.length} Items Available
          </span>
        </div>

        {/* Snacks Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {snackProducts.map(product => (
            <ProductCard key={product.id} product={product} badge={`${product.discount}% OFF`} badgeColor="#E11D48" />
          ))}
        </div>
      </div>

      {/* 🌾 SECTION 2: GROCERY & STAPLES (WITH BANNER DIRECTLY ABOVE) */}
      <div id="grocery-section" className="container" style={{ marginTop: isMobile ? '36px' : '48px' }}>
        {/* Banner 2: Weekend Grocery Fest */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid #BFDBFE',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: '#2563EB', color: '#FFFFFF', fontSize: '11px', fontWeight: 900, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
              🎁 Buy 2 Get 1 FREE
            </span>
            <h2 style={{ margin: '10px 0 4px', fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#1E3A8A' }}>
              Grocery & Staples Fest
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#1E40AF' }}>
              Unbeatable prices on Aashirvaad Sharbati Atta, Tata Toor Dal, Fortune Oil & Basmati Rice!
            </p>
          </div>
          <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
            🌾 {groceryProducts.length} Items Available
          </span>
        </div>

        {/* Grocery Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {groceryProducts.map(product => (
            <ProductCard key={product.id} product={product} badge={`${product.discount}% OFF`} badgeColor="#2563EB" />
          ))}
        </div>
      </div>

      {/* 💄 SECTION 3: BODY & SKINCARE (WITH BANNER DIRECTLY ABOVE) */}
      <div id="skincare-section" className="container" style={{ marginTop: isMobile ? '36px' : '48px' }}>
        {/* Banner 3: Personal Care Sale */}
        <div style={{
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1.5px solid #DDD6FE',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '11px', fontWeight: 900, padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
              ✨ Min 40% OFF
            </span>
            <h2 style={{ margin: '10px 0 4px', fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#4C1D95' }}>
              Body & Skincare Sale
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#5B21B6' }}>
              Deep nourishment with Dove Body Lotion, Dettol Soaps, Nivea Cream & Himalaya Care!
            </p>
          </div>
          <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
            💄 {skincareProducts.length} Items Available
          </span>
        </div>

        {/* Skincare Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {skincareProducts.map(product => (
            <ProductCard key={product.id} product={product} badge={`${product.discount}% OFF`} badgeColor="#7C3AED" />
          ))}
        </div>
      </div>
    </div>
  );
}
