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

      {/* 🔮 1. Main Hero Commercial Banner Card */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '20px', marginBottom: isMobile ? '16px' : '24px' }}>
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

      {/* 🌟 SLIM, ELEGANT ANIMATED DEAL HIGHLIGHTS TICKER */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px', marginBottom: isMobile ? '24px' : '36px' }}>
        <style>{`
          @keyframes tickerMove {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={{
          background: 'linear-gradient(90deg, #6B21A8 0%, #7C3AED 50%, #8B5CF6 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '10px 16px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(107, 33, 168, 0.15)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            whiteSpace: 'nowrap',
            animation: 'tickerMove 20s linear infinite',
            width: '200%'
          }}>
            {[1, 2].map(loop => (
              <div key={loop} style={{ display: 'inline-flex', alignItems: 'center', gap: '32px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.3px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>⚡ FLAT 50% OFF SNACKS &amp; MUNCHIES</span>
                <span style={{ color: '#DDD6FE', opacity: 0.6 }}>✦</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>🎁 BUY 2 GET 1 FREE GROCERY FEST</span>
                <span style={{ color: '#DDD6FE', opacity: 0.6 }}>✦</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>✨ MIN 40% OFF BODY &amp; SKINCARE</span>
                <span style={{ color: '#DDD6FE', opacity: 0.6 }}>✦</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>🚚 10-MINUTE EXPRESS DOORSTEP DELIVERY</span>
                <span style={{ color: '#DDD6FE', opacity: 0.6 }}>✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🍿 SECTION 1: SNACKS & MUNCHIES */}
      <div id="snacks-section" className="container" style={{ marginBottom: isMobile ? '36px' : '48px' }}>
        {/* Commercial Banner Graphic 1: Midnight Flash Snacks */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #FECDD3',
          boxShadow: '0 12px 32px rgba(225, 29, 72, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-snacks-munchies.png"
            alt="Flat 50% OFF Snacks & Munchies - Lay's, Kurkure, Doritos, Pringles, Kellogg's & Cadbury"
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '320px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
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

      {/* 🌾 SECTION 2: GROCERY & STAPLES */}
      <div id="grocery-section" className="container" style={{ marginBottom: isMobile ? '36px' : '48px' }}>
        {/* Commercial Banner Graphic 2: Weekend Grocery Fest */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #BFDBFE',
          boxShadow: '0 12px 32px rgba(37, 99, 235, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-grocery-staples.png"
            alt="Grocery & Staples Fest - Buy 2 Get 1 FREE on Aashirvaad Atta, Tata Toor Dal, Fortune Oil & Basmati Rice"
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '320px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
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

      {/* 💄 SECTION 3: BODY & SKINCARE */}
      <div id="skincare-section" className="container" style={{ marginBottom: isMobile ? '36px' : '48px' }}>
        {/* Commercial Banner Graphic 3: Personal Care Super Sale */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #DDD6FE',
          boxShadow: '0 12px 32px rgba(124, 58, 237, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-body-skincare.png"
            alt="Body & Skincare Sale - Min 40% OFF on Dove Lotion, Dettol Soap, Nivea Cream & Himalaya Care"
            style={{
              width: '100%',
              height: isMobile ? 'auto' : '320px',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
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
