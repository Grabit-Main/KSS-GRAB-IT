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
    <div style={{ backgroundColor: '#F8FAF5', minHeight: '100vh', paddingBottom: '60px', paddingTop: isMobile ? '16px' : '24px' }}>
      {/* Top Search Bar */}
      <div className="container" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search fresh vegetables, fruits, herbs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container">

        {/* Product Grid / Categorized Sections */}
        {filteredProducts.length > 0 ? (
          (selectedSubcat === 'all' && !searchQuery) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* 🥦 SECTION 1: FRESH VEGETABLES */}
              {(() => {
                const vegList = produceProducts.filter(p => {
                  const n = (p.name || '').toLowerCase();
                  return n.includes('tomato') || n.includes('capsicum') || n.includes('onion') || n.includes('potato') || n.includes('broccoli') || n.includes('carrot') || p.subcat === 'vegetables';
                });
                if (vegList.length === 0) return null;
                return (
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #E8EFE2', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    {/* 🥦 Dedicated Vegetable Section Hero Graphic Banner */}
                    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '18px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                      <img
                        src="/banner-fresh-vegetables-section.jpg"
                        alt="Fresh Vegetables &amp; Goodness - Handpicked &amp; Farm Fresh Vegetables Delivered"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>🥦</span>
                        <div>
                          <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '19px', fontWeight: 800, color: '#14532D' }}>
                            Fresh Vegetables
                          </h2>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                            Farm-picked, pesticide-free daily cooking vegetables
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: isMobile ? '12px' : '18px'
                    }}>
                      {vegList.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 🍎 SECTION 2: FARM FRESH FRUITS */}
              {(() => {
                const fruitList = produceProducts.filter(p => {
                  const n = (p.name || '').toLowerCase();
                  return n.includes('apple') || n.includes('banana') || n.includes('grape') || n.includes('avocado') || n.includes('orange') || n.includes('mango') || p.subcat === 'fruits' || p.subcat === 'exotic';
                });
                if (fruitList.length === 0) return null;
                return (
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #FEF3C7', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    {/* 🍎 Dedicated Fruit Section Hero Graphic Banner */}
                    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '18px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                      <img
                        src="/banner-fresh-fruits.jpg"
                        alt="Fresh Fruits &amp; Goodness - Handpicked &amp; Farm Fresh Fruits Delivered"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>🍎</span>
                        <div>
                          <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '19px', fontWeight: 800, color: '#92400E' }}>
                            Farm Fresh &amp; Organic Fruits
                          </h2>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                            Sweet, juicy &amp; vitamin-rich seasonal &amp; imported fruits
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: isMobile ? '12px' : '18px'
                    }}>
                      {fruitList.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 🥬 SECTION 3: LEAFY GREENS & HERBS */}
              {(() => {
                const greensList = produceProducts.filter(p => {
                  const n = (p.name || '').toLowerCase();
                  return n.includes('spinach') || n.includes('mint') || n.includes('coriander') || p.subcat === 'greens' || p.subcat === 'herbs';
                });
                if (greensList.length === 0) return null;
                return (
                  <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #DCFCE7', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    {/* 🥬 Dedicated Leafy Greens Graphic Banner */}
                    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                      <img
                        src="/banner-leafy-greens-section.jpg"
                        alt="Leafy Greens &amp; Kitchen Herbs - Hydroponic spinach, fresh mint &amp; herbs"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>🥬</span>
                        <div>
                          <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '19px', fontWeight: 800, color: '#166534' }}>
                            Leafy Greens &amp; Kitchen Herbs
                          </h2>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                            Hydroponic spinach, fresh mint, coriander &amp; aromatic herbs
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: isMobile ? '12px' : '18px'
                    }}>
                      {greensList.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: isMobile ? '12px' : '18px'
            }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
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
