import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import useWindowWidth from '../hooks/useWindowWidth';

export default function FreshProducePage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  // 🍎 ALL FRESH FRUITS
  const fruitProducts = useMemo(() => [
    { id: 507, name: "Royal Gala Crisp Apples 4 Pcs (~500g)", weight: "500g", price: 129, mrp: 180, discount: 28, rating: 4.9, reviews: 1150, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 65 },
    { id: 508, name: "Fresh Robusta Bananas 6 Pcs (~800g)", weight: "6 Pcs", price: 45, mrp: 65, discount: 30, rating: 4.8, reviews: 1890, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 90 },
    { id: 509, name: "Fresh Seedless Green Grapes 500g", weight: "500g", price: 89, mrp: 120, discount: 25, rating: 4.9, reviews: 810, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 50 },
    { id: 510, name: "Fresh Ruby Red Pomegranate / Anar 1kg Pack", weight: "1kg", price: 185, mrp: 260, discount: 28, rating: 4.9, reviews: 740, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 45 },
    { id: 511, name: "Fresh Semi-Ripe Papaya 1 Pc (~1kg)", weight: "1kg", price: 58, mrp: 80, discount: 27, rating: 4.8, reviews: 490, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 40 },
    { id: 512, name: "Fresh Imported Zespri Green Kiwi 3 Pcs Pack", weight: "3 Pcs", price: 135, mrp: 180, discount: 25, rating: 4.9, reviews: 620, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 35 },
    { id: 513, name: "Fresh Sweet Nagpur Oranges 1kg Pack", weight: "1kg", price: 95, mrp: 140, discount: 32, rating: 4.8, reviews: 890, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 60 },
    { id: 514, name: "Fresh Ratnagiri Alphonso Mangoes 1kg Box", weight: "1kg", price: 349, mrp: 499, discount: 30, rating: 5.0, reviews: 2400, image: "fresh-fruits-veggies-hero-transparent.png", category: "fruits", brand: "Fresh Orchard", inStock: true, stock_quantity: 30 }
  ], []);

  // 🥕 ALL FRESH VEGETABLES
  const vegetableProducts = useMemo(() => [
    { id: 501, name: "Fresh Hybrid Red Tomatoes 1kg", weight: "1kg", price: 32, mrp: 45, discount: 28, rating: 4.9, reviews: 1420, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 80 },
    { id: 502, name: "Fresh Green Capsicum / Shimla Mirch 500g", weight: "500g", price: 42, mrp: 60, discount: 30, rating: 4.8, reviews: 980, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 60 },
    { id: 503, name: "Fresh Nashik Red Onions 1kg Pack", weight: "1kg", price: 38, mrp: 55, discount: 30, rating: 4.9, reviews: 2100, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 100 },
    { id: 504, name: "Fresh Farm Potatoes / Aloo 1kg", weight: "1kg", price: 28, mrp: 40, discount: 30, rating: 4.8, reviews: 1750, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 120 },
    { id: 505, name: "Fresh Green Broccoli 250g", weight: "250g", price: 49, mrp: 70, discount: 30, rating: 4.7, reviews: 310, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 40 },
    { id: 506, name: "Fresh Crunchy Carrots / Gajar 500g", weight: "500g", price: 35, mrp: 50, discount: 30, rating: 4.8, reviews: 620, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 55 },
    { id: 515, name: "Fresh White Cauliflower / Gobi 1 Pc (~500g)", weight: "1 Pc", price: 39, mrp: 55, discount: 29, rating: 4.8, reviews: 540, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 45 },
    { id: 516, name: "Fresh Garlic / Lahsun 250g Pack", weight: "250g", price: 65, mrp: 95, discount: 31, rating: 4.9, reviews: 830, image: "fresh-fruits-veggies-hero-transparent.png", category: "vegetables", brand: "Farm Fresh", inStock: true, stock_quantity: 70 }
  ], []);

  return (
    <div style={{ backgroundColor: '#F8FAF5', color: '#14532D', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sticky Top Header Bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: isMobile ? '12px 0' : '14px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/" aria-label="Back to Store" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '38px', height: '38px', borderRadius: '12px',
              background: '#F0FDF4', color: '#166534',
              textDecoration: 'none', transition: 'all 0.2s ease',
              border: '1px solid #DCFCE7',
              boxShadow: '0 2px 8px rgba(22, 101, 52, 0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.transform = 'none'; }}
            >
              <ArrowLeft size={20} color="#166534" />
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: 900,
                color: '#14532D',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}>
                Fresh Fruits & Vegetables
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                100% Farm Fresh & Organic • Delivered in 10 mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🍎 SECTION 1: FRESH FRUITS */}
      <div id="fruits-section" className="container" style={{ marginTop: isMobile ? '16px' : '24px', marginBottom: isMobile ? '40px' : '52px' }}>
        {/* Commercial Banner 1: Fresh Fruits & Goodness */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #DCFCE7',
          boxShadow: '0 12px 32px rgba(22, 101, 52, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-fresh-fruits.png"
            alt="Fresh Fruits & Goodness - Handpicked & Farm Fresh Fruits Delivered to your Doorstep"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* All Fruits Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {fruitProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badge={`${product.discount}% OFF`}
              badgeColor="#15803D"
            />
          ))}
        </div>
      </div>

      {/* 🥕 SECTION 2: FRESH VEGETABLES */}
      <div id="vegetables-section" className="container" style={{ marginBottom: isMobile ? '40px' : '52px' }}>
        {/* Commercial Banner 2: Fresh Vegetables & Goodness */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #DCFCE7',
          boxShadow: '0 12px 32px rgba(22, 101, 52, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-fresh-vegetables.png"
            alt="Fresh Vegetables & Goodness - Handpicked & Farm Fresh Vegetables Delivered to your Doorstep"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* All Vegetables Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {vegetableProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badge={`${product.discount}% OFF`}
              badgeColor="#15803D"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
