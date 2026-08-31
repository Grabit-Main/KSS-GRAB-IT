import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function PharmacyPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;
  const [selectedSubcat, setSelectedSubcat] = useState('all');

  // Pharmacy & Wellness items
  const pharmacyProducts = useMemo(() => {
    const base = products.filter(p => p.category === 'personal-care' || p.name.toLowerCase().includes('dettol') || p.name.toLowerCase().includes('soap') || p.name.toLowerCase().includes('toothpaste'));
    
    const extraPharmacyItems = [
      { id: 201, name: "Vicks VapoRub Balm 50g Relief from Cold & Cough", weight: "50g", price: 155, mrp: 175, discount: 11, rating: 4.9, reviews: 1240, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "cold", brand: "Vicks", inStock: true, stock_quantity: 60 },
      { id: 202, name: "Moov Fast Pain Relief Ointment 50g Tube", weight: "50g", price: 165, mrp: 190, discount: 13, rating: 4.8, reviews: 980, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "pain", brand: "Moov", inStock: true, stock_quantity: 45 },
      { id: 203, name: "Eno Fizzy Lemon Fast Relief Sachets (Pack of 6)", weight: "30g", price: 60, mrp: 72, discount: 17, rating: 4.9, reviews: 1450, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "digestive", brand: "Eno", inStock: true, stock_quantity: 80 },
      { id: 204, name: "Revital H Daily Health Supplement 30 Capsules", weight: "30 Caps", price: 310, mrp: 360, discount: 14, rating: 4.8, reviews: 760, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "vitamins", brand: "Revital", inStock: true, stock_quantity: 35 },
      { id: 205, name: "Hansaplast Waterproof First Aid Bandages (20 Pcs)", weight: "20 Pcs", price: 75, mrp: 90, discount: 17, rating: 4.9, reviews: 1120, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "firstaid", brand: "Hansaplast", inStock: true, stock_quantity: 90 },
      { id: 206, name: "Volini Pain Relief Spray 100g Instant Relief", weight: "100g", price: 215, mrp: 260, discount: 17, rating: 4.9, reviews: 1310, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "pain", brand: "Volini", inStock: true, stock_quantity: 50 },
      { id: 207, name: "Dettol Antiseptic Liquid 550ml", weight: "550ml", price: 210, mrp: 245, discount: 14, rating: 4.9, reviews: 2100, image: "banner-exclusive-deals.png", category: "pharmacy", subcat: "firstaid", brand: "Dettol", inStock: true, stock_quantity: 85 }
    ];

    const combined = [...base];
    extraPharmacyItems.forEach(item => {
      if (!combined.some(p => p.id === item.id)) combined.push(item);
    });

    return combined;
  }, []);

  const subcategories = [
    { id: 'all', label: '💊 All Pharmacy & Wellness' },
    { id: 'cold', label: '🤧 Cold, Cough & Flu' },
    { id: 'pain', label: '⚡ Pain Relief' },
    { id: 'digestive', label: '🍋 Antacids & Digestion' },
    { id: 'firstaid', label: '🩹 First Aid & Hygiene' },
    { id: 'vitamins', label: '🌿 Vitamins & Health' }
  ];

  const filteredProducts = useMemo(() => {
    return pharmacyProducts.filter(p => {
      if (selectedSubcat === 'all') return true;
      if (selectedSubcat === 'cold') return (p.name.toLowerCase().includes('vicks') || p.subcat === 'cold');
      if (selectedSubcat === 'pain') return (p.name.toLowerCase().includes('moov') || p.name.toLowerCase().includes('volini') || p.subcat === 'pain');
      if (selectedSubcat === 'digestive') return (p.name.toLowerCase().includes('eno') || p.subcat === 'digestive');
      if (selectedSubcat === 'firstaid') return (p.name.toLowerCase().includes('dettol') || p.name.toLowerCase().includes('hansaplast') || p.subcat === 'firstaid');
      if (selectedSubcat === 'vitamins') return (p.name.toLowerCase().includes('revital') || p.subcat === 'vitamins');
      return true;
    });
  }, [pharmacyProducts, selectedSubcat]);

  return (
    <div style={{ backgroundColor: '#FBF9FE', color: '#4C1D95', minHeight: '100vh', paddingBottom: '60px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sticky Top Header Bar */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E9D5FF',
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
                color: '#4C1D95',
                letterSpacing: '-0.3px',
                lineHeight: 1.2
              }}>
                Pharmacy at your Doorstep
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                100% Genuine Medicines & Health • Express 10-Min Delivery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Banner Card */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '20px' }}>
        <div style={{
          borderRadius: isMobile ? '20px' : '28px',
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(107, 33, 168, 0.12)',
          border: '1.5px solid #E9D5FF',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-pharmacy.png"
            alt="Pharmacy at your doorstep - Trusted Care Delivered"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* Filter Pills Bar */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px', marginBottom: isMobile ? '20px' : '28px' }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {subcategories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubcat(tab.id)}
              style={{
                padding: '9px 18px',
                borderRadius: '20px',
                border: selectedSubcat === tab.id ? '1.5px solid #6B21A8' : '1px solid #E9D5FF',
                background: selectedSubcat === tab.id ? 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)' : '#FFFFFF',
                color: selectedSubcat === tab.id ? '#FFFFFF' : '#374151',
                fontSize: '13px',
                fontWeight: selectedSubcat === tab.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedSubcat === tab.id ? '0 4px 14px rgba(107, 33, 168, 0.22)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direct Pharmacy Products Grid */}
      <div className="container">
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
                badge={product.discount ? `${product.discount}% OFF` : 'GENUINE'}
                badgeColor="#7C3AED"
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
            <Gift size={54} color="#6B21A8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#4C1D95' }}>No items found in this category</h3>
            <button
              onClick={() => setSelectedSubcat('all')}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Show All Pharmacy Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
