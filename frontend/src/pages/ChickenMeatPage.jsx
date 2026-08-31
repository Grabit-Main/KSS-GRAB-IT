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

  // Meat & Seafood catalog with rich items
  const meatProducts = useMemo(() => {
    const items = [
      { id: 301, name: "Fresh Tender Chicken Curry Cut 500g", weight: "500g", price: 165, mrp: 195, discount: 15, rating: 4.9, reviews: 1420, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "chicken", cut: "curry", brand: "Grabit Meat", inStock: true, stock_quantity: 50 },
      { id: 302, name: "Fresh Antibiotic-Free Chicken Breast Boneless 400g", weight: "400g", price: 220, mrp: 260, discount: 15, rating: 4.9, reviews: 980, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "chicken", cut: "boneless", brand: "Grabit Meat", inStock: true, stock_quantity: 40 },
      { id: 306, name: "Fresh Juicy Chicken Drumsticks 500g", weight: "500g", price: 185, mrp: 210, discount: 12, rating: 4.8, reviews: 730, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "chicken", cut: "drumsticks", brand: "Grabit Meat", inStock: true, stock_quantity: 45 },
      { id: 305, name: "Farm Fresh Brown Protein Eggs (Pack of 12)", weight: "12 Eggs", price: 110, mrp: 130, discount: 15, rating: 4.9, reviews: 2150, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "eggs", cut: "whole", brand: "Grabit Farm", inStock: true, stock_quantity: 80 },
      { id: 307, name: "Farm Fresh White Table Eggs (Pack of 30)", weight: "30 Eggs", price: 199, mrp: 240, discount: 17, rating: 4.8, reviews: 1890, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "eggs", cut: "whole", brand: "Grabit Farm", inStock: true, stock_quantity: 90 },

      { id: 303, name: "Fresh Rich Mutton Curry Cut (Rich Meat) 500g", weight: "500g", price: 449, mrp: 520, discount: 14, rating: 4.8, reviews: 670, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "mutton", cut: "curry", brand: "Grabit Meat", inStock: true, stock_quantity: 25 },
      { id: 308, name: "Fresh Premium Mutton Biryani Cut 500g", weight: "500g", price: 480, mrp: 550, discount: 13, rating: 4.9, reviews: 810, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "mutton", cut: "curry", brand: "Grabit Meat", inStock: true, stock_quantity: 30 },
      { id: 309, name: "Fresh Fine Mutton Minced (Keema) 250g", weight: "250g", price: 260, mrp: 300, discount: 13, rating: 4.7, reviews: 420, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "mutton", cut: "minced", brand: "Grabit Meat", inStock: true, stock_quantity: 20 },
      { id: 304, name: "Fresh Rohu Fish Steaks Cut 500g", weight: "500g", price: 195, mrp: 230, discount: 15, rating: 4.7, reviews: 540, image: "instant-noodles-hero-transparent.png", category: "meat", subcat: "fish", cut: "steaks", brand: "Grabit Seafood", inStock: true, stock_quantity: 30 }
    ];

    return items;
  }, []);

  const filteredProducts = useMemo(() => {
    return meatProducts.filter(p => {
      return !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [meatProducts, searchQuery]);

  return (
    <div style={{ backgroundColor: '#FFFDF9', minHeight: '100vh', paddingBottom: '60px', paddingTop: isMobile ? '16px' : '24px' }}>
      {/* Top Search Bar */}
      <div className="container" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search fresh chicken, eggs, mutton, fish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '14px',
              border: '1px solid #FCA5A5',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          />
        </div>
      </div>

      {/* Main Content Area: Categorized Sections */}
      <div className="container">
        {filteredProducts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 🍗 SECTION 1: FRESH CHICKEN & FARM EGGS */}
            {(() => {
              const chickenEggsList = meatProducts.filter(p => p.subcat === 'chicken' || p.subcat === 'eggs');
              if (chickenEggsList.length === 0) return null;
              return (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #FFEDD5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  {/* 🐓 Dedicated Chicken & Farm Eggs Graphic Banner */}
                  <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                    <img
                      src="/banner-chicken-eggs.jpg"
                      alt="Fresh Chicken & Farm Eggs - Wholesome nutrition for your family"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#9A3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🍗 Fresh Chicken &amp; Farm Eggs
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                      100% Antibiotic-free farm chicken cuts &amp; fresh protein eggs
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: isMobile ? '12px' : '18px'
                  }}>
                    {chickenEggsList.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 🥩 SECTION 2: FRESH MEAT & MUTTON CUTS */}
            {(() => {
              const meatList = meatProducts.filter(p => p.subcat === 'mutton' || p.subcat === 'fish');
              if (meatList.length === 0) return null;
              return (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #FEE2E2', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  {/* 🥩 Dedicated Fresh Meat Graphic Banner */}
                  <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                    <img
                      src="/banner-fresh-meat-section.jpg"
                      alt="Fresh Meat & Goodness - Premium quality meat, hygienically cut & delivered"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🥩 Fresh Meat &amp; Mutton Cuts
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                      Tender mutton curry cuts, biryani cuts, minced keema &amp; fresh fish
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: isMobile ? '12px' : '18px'
                  }}>
                    {meatList.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })()}
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
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try searching for another item or resetting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
