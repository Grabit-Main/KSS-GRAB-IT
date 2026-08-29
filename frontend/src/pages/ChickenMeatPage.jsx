import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Snowflake, Flame, ChevronRight, Search, Check, Award } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ChickenMeatPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [selectedCut, setSelectedCut] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Meat & Seafood catalog
  const meatProducts = useMemo(() => {
    const extraMeatItems = [
      { id: 301, name: "Fresh Tender Chicken Curry Cut 500g", weight: "500g", price: 165, mrp: 195, discount: 15, rating: 4.9, reviews: 1420, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "chicken", cut: "curry", brand: "Grabit Meat", inStock: true, stock_quantity: 50 },
      { id: 302, name: "Fresh Antibiotic-Free Chicken Breast Boneless 400g", weight: "400g", price: 220, mrp: 260, discount: 15, rating: 4.9, reviews: 980, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "chicken", cut: "boneless", brand: "Grabit Meat", inStock: true, stock_quantity: 40 },
      { id: 303, name: "Fresh Rich Mutton Curry Cut (Rich Meat) 500g", weight: "500g", price: 449, mrp: 520, discount: 14, rating: 4.8, reviews: 670, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "mutton", cut: "curry", brand: "Grabit Meat", inStock: true, stock_quantity: 25 },
      { id: 304, name: "Fresh Rohu Fish Steaks Cut 500g", weight: "500g", price: 195, mrp: 230, discount: 15, rating: 4.7, reviews: 540, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "fish", cut: "steaks", brand: "Grabit Seafood", inStock: true, stock_quantity: 30 },
      { id: 305, name: "Farm Fresh Brown Protein Eggs (Pack of 12)", weight: "12 Eggs", price: 110, mrp: 130, discount: 15, rating: 4.9, reviews: 2150, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "eggs", cut: "whole", brand: "Grabit Farm", inStock: true, stock_quantity: 80 }
    ];

    return extraMeatItems;
  }, []);

  const subcategories = [
    { id: 'all', label: '🍗 All Meat & Seafood', icon: '🥩' },
    { id: 'chicken', label: '🐓 Fresh Chicken', icon: '🍗' },
    { id: 'mutton', label: '🐐 Mutton & Lamb', icon: '🥩' },
    { id: 'fish', label: '🐟 Fish & Seafood', icon: '🦐' },
    { id: 'eggs', label: '🥚 Farm Eggs', icon: '🍳' }
  ];

  const cutTypes = [
    { id: 'all', label: 'All Cuts' },
    { id: 'curry', label: 'Curry Cut' },
    { id: 'boneless', label: 'Boneless' },
    { id: 'steaks', label: 'Fish Steaks' }
  ];

  const filteredProducts = useMemo(() => {
    return meatProducts.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubcat = selectedSubcat === 'all' || p.subcat === selectedSubcat;
      const matchCut = selectedCut === 'all' || p.cut === selectedCut;
      return matchSearch && matchSubcat && matchCut;
    });
  }, [meatProducts, selectedSubcat, selectedCut, searchQuery]);

  return (
    <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Breadcrumb Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #FED7AA', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
          <Link to="/" style={{ color: '#991B1B', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={14} color="#999" />
          <span style={{ color: '#1F2937', fontWeight: 700 }}>Fresh Chicken & Meat</span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '24px' }}>
        <div style={{
          borderRadius: isMobile ? '16px' : '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(153, 27, 27, 0.12)',
          border: '1.5px solid rgba(239, 68, 68, 0.25)',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-meat.png"
            alt="Fresh Chicken & Meat - Premium Quality 100% Fresh"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* Cold-Chain & Hygiene Feature Badges */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          {[
            { icon: <Snowflake color="#991B1B" size={20} />, title: "0 - 4°C Chilled Storage", desc: "Never frozen, always fresh" },
            { icon: <ShieldCheck color="#991B1B" size={20} />, title: "100% Antibiotic Free", desc: "No added hormones or chemicals" },
            { icon: <Flame color="#991B1B" size={20} />, title: "RO Water Cleaned", desc: "Hygienically cut & vacuum sealed" },
            { icon: <Award color="#991B1B" size={20} />, title: "Halal & FSSAI Certified", desc: "100% safety & quality assured" }
          ].map((item, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid #FEE2E2'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#991B1B' }}>{item.title}</h4>
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
          border: '1px solid #FEE2E2',
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
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#7F1D1D', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥩 Premium Meat & Seafood Market
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                100% Fresh, cut & tender chicken, mutton, fish & seafood delivered chilled in 10 mins.
              </p>
            </div>

            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search chicken, mutton, fish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  border: '1px solid #FCA5A5',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Subcategory Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
            {subcategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubcat(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: selectedSubcat === cat.id ? '2px solid #991B1B' : '1px solid #FEE2E2',
                  background: selectedSubcat === cat.id ? '#FEF2F2' : '#FFFFFF',
                  color: selectedSubcat === cat.id ? '#991B1B' : '#4B5563',
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

          {/* Cut Type Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #FEE2E2' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter Cut:</span>
            {cutTypes.map(cut => (
              <button
                key={cut.id}
                onClick={() => setSelectedCut(cut.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedCut === cut.id ? '#991B1B' : '#F3F4F6',
                  color: selectedCut === cut.id ? '#FFFFFF' : '#4B5563',
                  fontSize: '12px',
                  fontWeight: selectedCut === cut.id ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {cut.label}
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
            border: '1px solid #FEE2E2'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1F2937' }}>No meat products found</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try changing cut type or subcategory filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
