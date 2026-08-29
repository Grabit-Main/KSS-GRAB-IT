import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, Sparkles, ChevronRight, Filter, Search, Award, RefreshCw, Star, Heart } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function FreshProducePage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Extended produce catalog for rich experience
  const produceProducts = useMemo(() => {
    const base = products.filter(p => p.category === 'produce' || p.category === 'fruits-veggies' || (p.name && (p.name.toLowerCase().includes('apple') || p.name.toLowerCase().includes('banana') || p.name.toLowerCase().includes('tomato') || p.name.toLowerCase().includes('capsicum') || p.name.toLowerCase().includes('onion'))));
    
    // Add extra curated produce items if list is small
    const extraItems = [
      { id: 101, name: "Fresh Hydroponic Baby Spinach 250g", weight: "250g", price: 45, mrp: 60, discount: 25, rating: 4.9, reviews: 340, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", subcat: "greens", brand: "Grabit Organic", inStock: true, stock_quantity: 40 },
      { id: 102, name: "Organic Hass Avocado 2 Pcs (Imported)", weight: "2 Pcs (~300g)", price: 199, mrp: 260, discount: 23, rating: 4.8, reviews: 520, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", subcat: "exotic", brand: "Grabit Organic", inStock: true, stock_quantity: 25 },
      { id: 103, name: "Fresh Seedless Green Grapes 500g", weight: "500g", price: 89, mrp: 120, discount: 25, rating: 4.9, reviews: 810, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", subcat: "fruits", brand: "Grabit Fresh", inStock: true, stock_quantity: 50 },
      { id: 104, name: "Fresh Broccoli Exotic 250g", weight: "250g", price: 49, mrp: 70, discount: 30, rating: 4.7, reviews: 290, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", subcat: "vegetables", brand: "Grabit Fresh", inStock: true, stock_quantity: 35 },
      { id: 105, name: "Fresh Mint & Coriander Combo Pack", weight: "200g", price: 25, mrp: 35, discount: 28, rating: 4.8, reviews: 670, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", subcat: "herbs", brand: "Grabit Organic", inStock: true, stock_quantity: 60 }
    ];

    const combined = [...base];
    extraItems.forEach(item => {
      if (!combined.some(p => p.id === item.id)) combined.push(item);
    });

    return combined;
  }, []);

  const subcategories = [
    { id: 'all', label: '🥦 All Produce', icon: '🥗' },
    { id: 'vegetables', label: '🥕 Fresh Vegetables', icon: '🌽' },
    { id: 'fruits', label: '🍎 Organic Fruits', icon: '🍓' },
    { id: 'exotic', label: '🥑 Exotic & Imported', icon: '🫐' },
    { id: 'greens', label: '🥬 Leafy Greens', icon: '🌿' },
    { id: 'herbs', label: '🧄 Herbs & Seasonings', icon: '🌶️' }
  ];

  const filteredProducts = useMemo(() => {
    return produceProducts.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedSubcat === 'all') return matchSearch;
      if (selectedSubcat === 'vegetables') return matchSearch && (p.name.toLowerCase().includes('tomato') || p.name.toLowerCase().includes('capsicum') || p.name.toLowerCase().includes('onion') || p.name.toLowerCase().includes('broccoli') || p.subcat === 'vegetables');
      if (selectedSubcat === 'fruits') return matchSearch && (p.name.toLowerCase().includes('apple') || p.name.toLowerCase().includes('banana') || p.name.toLowerCase().includes('grapes') || p.subcat === 'fruits');
      if (selectedSubcat === 'exotic') return matchSearch && (p.name.toLowerCase().includes('avocado') || p.subcat === 'exotic');
      if (selectedSubcat === 'greens') return matchSearch && (p.name.toLowerCase().includes('spinach') || p.subcat === 'greens');
      if (selectedSubcat === 'herbs') return matchSearch && (p.name.toLowerCase().includes('mint') || p.name.toLowerCase().includes('coriander') || p.subcat === 'herbs');
      return matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.reviews || 0) - (a.reviews || 0);
    });
  }, [produceProducts, selectedSubcat, searchQuery, sortBy]);

  return (
    <div style={{ backgroundColor: '#F8FAF5', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Breadcrumb Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E9E0', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
          <Link to="/" style={{ color: '#166534', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={14} color="#999" />
          <span style={{ color: '#1F2937', fontWeight: 700 }}>Fresh Vegetables & Fruits</span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '24px' }}>
        <div style={{
          borderRadius: isMobile ? '16px' : '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(22, 101, 52, 0.12)',
          border: '1.5px solid rgba(34, 197, 94, 0.2)',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-fruits-veggies.png"
            alt="Fresh Vegetables & Fruits - 100% Organic & Farm Fresh"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* Feature Badges Row */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          {[
            { icon: <Leaf color="#166534" size={20} />, title: "100% Organic Certified", desc: "Sourced directly from verified farms" },
            { icon: <ShieldCheck color="#166534" size={20} />, title: "Zero Pesticides", desc: "Ozone washed & safety tested" },
            { icon: <Truck color="#166534" size={20} />, title: "10-Minute Express", desc: "Temperature controlled delivery" },
            { icon: <Award color="#166534" size={20} />, title: "Farm Fresh Guarantee", desc: "100% refund if not fresh" }
          ].map((item, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid #E8EFE2'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#166534' }}>{item.title}</h4>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#6B7280' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '28px' }}>
        {/* Category Header & Filters */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: isMobile ? '16px' : '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid #E8EFE2',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#14532D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥗 Farm Fresh Produce Store
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4B5563' }}>
                Handpicked farm-fresh vegetables & fruits delivered to your doorstep in 10 mins.
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search produce..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid #D1D5DB',
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
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  background: '#FFFFFF',
                  color: '#374151',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Subcategory Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {subcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubcat(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: selectedSubcat === cat.id ? '2px solid #166534' : '1px solid #E5E7EB',
                  background: selectedSubcat === cat.id ? '#F0FDF4' : '#FFFFFF',
                  color: selectedSubcat === cat.id ? '#166534' : '#4B5563',
                  fontSize: '13px',
                  fontWeight: selectedSubcat === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: isMobile ? '12px' : '18px'
          }}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #E8EFE2'
          }}>
            <Leaf size={48} color="#166534" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1F2937' }}>No items found in this filter</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try searching for another produce item or clearing your filter.</p>
            <button
              onClick={() => { setSelectedSubcat('all'); setSearchQuery(''); }}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                background: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
