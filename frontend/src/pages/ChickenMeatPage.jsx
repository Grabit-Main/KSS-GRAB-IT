import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ChickenMeatPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  // 🐓 1. ALL CHICKEN & EGGS PRODUCTS
  const chickenAndEggProducts = useMemo(() => [
    { id: 301, name: "Fresh Tender Chicken Curry Cut 500g", weight: "500g", price: 165, mrp: 195, discount: 15, rating: 4.9, reviews: 1420, image: "raw-chicken.jpg", category: "meat", subcat: "chicken", brand: "Grabit Meat", inStock: true, stock_quantity: 50 },
    { id: 302, name: "Fresh Antibiotic-Free Chicken Breast Boneless 400g", weight: "400g", price: 220, mrp: 260, discount: 15, rating: 4.9, reviews: 980, image: "raw-chicken.jpg", category: "meat", subcat: "chicken", brand: "Grabit Meat", inStock: true, stock_quantity: 40 },
    { id: 306, name: "Fresh Chicken Drumsticks / Tangdi 500g Pack", weight: "500g", price: 185, mrp: 220, discount: 16, rating: 4.9, reviews: 1120, image: "raw-chicken.jpg", category: "meat", subcat: "chicken", brand: "Grabit Meat", inStock: true, stock_quantity: 45 },
    { id: 308, name: "Fresh Tender Chicken Wings 500g Pack", weight: "500g", price: 145, mrp: 175, discount: 17, rating: 4.8, reviews: 750, image: "raw-chicken.jpg", category: "meat", subcat: "chicken", brand: "Grabit Meat", inStock: true, stock_quantity: 60 },
    { id: 305, name: "Farm Fresh Brown Protein Eggs (Pack of 12)", weight: "12 Eggs", price: 110, mrp: 130, discount: 15, rating: 4.9, reviews: 2150, image: "raw-chicken.jpg", category: "meat", subcat: "eggs", brand: "Grabit Farm", inStock: true, stock_quantity: 80 },
    { id: 309, name: "Farm Fresh White Eggs Economy Tray (Pack of 30)", weight: "30 Eggs", price: 215, mrp: 250, discount: 14, rating: 4.9, reviews: 1680, image: "raw-chicken.jpg", category: "meat", subcat: "eggs", brand: "Grabit Farm", inStock: true, stock_quantity: 100 }
  ], []);

  // 🥩 2. ALL FRESH MEAT & SEAFOOD PRODUCTS
  const meatAndSeafoodProducts = useMemo(() => [
    { id: 303, name: "Fresh Rich Mutton Curry Cut (Rich Meat) 500g", weight: "500g", price: 449, mrp: 520, discount: 14, rating: 4.8, reviews: 670, image: "raw-meat.jpg", category: "meat", subcat: "mutton", brand: "Grabit Meat", inStock: true, stock_quantity: 25 },
    { id: 310, name: "Fresh Premium Mutton Ribs & Chops 500g", weight: "500g", price: 495, mrp: 580, discount: 15, rating: 4.9, reviews: 520, image: "raw-meat.jpg", category: "meat", subcat: "mutton", brand: "Grabit Meat", inStock: true, stock_quantity: 20 },
    { id: 311, name: "Fresh Boneless Mutton Boti Cut 400g", weight: "400g", price: 520, mrp: 610, discount: 15, rating: 4.9, reviews: 410, image: "raw-meat.jpg", category: "meat", subcat: "mutton", brand: "Grabit Meat", inStock: true, stock_quantity: 15 },
    { id: 304, name: "Fresh Rohu Fish Steaks Cut 500g", weight: "500g", price: 195, mrp: 230, discount: 15, rating: 4.7, reviews: 540, image: "raw-meat.jpg", category: "meat", subcat: "fish", brand: "Grabit Seafood", inStock: true, stock_quantity: 30 },
    { id: 307, name: "Fresh Tiger Prawns Cleaned & Deveined 250g", weight: "250g", price: 299, mrp: 360, discount: 17, rating: 4.9, reviews: 830, image: "raw-meat.jpg", category: "meat", subcat: "fish", brand: "Grabit Seafood", inStock: true, stock_quantity: 35 }
  ], []);

  return (
    <div style={{ backgroundColor: '#FFFDF9', color: '#991B1B', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sticky Top Header Bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #FED7AA',
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
              background: '#FEF2F2', color: '#991B1B',
              textDecoration: 'none', transition: 'all 0.2s ease',
              border: '1px solid #FEE2E2',
              boxShadow: '0 2px 8px rgba(153, 27, 27, 0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'none'; }}
            >
              <ArrowLeft size={20} color="#991B1B" />
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: 900,
                color: '#991B1B',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}>
                Fresh Chicken & Meat
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                100% Antibiotic Free • Freshly Cut • Delivered Chilled in 10 mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🐓 SECTION 1: FRESH CHICKEN & FARM EGGS */}
      <div id="chicken-eggs-section" className="container" style={{ marginTop: isMobile ? '16px' : '24px', marginBottom: isMobile ? '40px' : '52px' }}>
        {/* Commercial Banner 1: Fresh Chicken & Farm Eggs */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #FEE2E2',
          boxShadow: '0 12px 32px rgba(153, 27, 27, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-fresh-chicken-eggs.png"
            alt="Fresh Chicken & Farm Eggs - Wholesome nutrition delivered fresh to your doorstep"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Chicken & Eggs Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {chickenAndEggProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badge={`${product.discount}% OFF`}
              badgeColor="#B91C1C"
            />
          ))}
        </div>
      </div>

      {/* 🥩 SECTION 2: FRESH MEAT & GOODNESS */}
      <div id="meat-section" className="container" style={{ marginBottom: isMobile ? '40px' : '52px' }}>
        {/* Commercial Banner 2: Fresh Meat & Goodness */}
        <div style={{
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          border: '1.5px solid #FEE2E2',
          boxShadow: '0 12px 32px rgba(153, 27, 27, 0.12)',
          marginBottom: '20px',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-fresh-meat.png"
            alt="Fresh Meat & Goodness - Premium quality meat hygienically cut & delivered"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Meat Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '20px'
        }}>
          {meatAndSeafoodProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              badge={`${product.discount}% OFF`}
              badgeColor="#B91C1C"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
