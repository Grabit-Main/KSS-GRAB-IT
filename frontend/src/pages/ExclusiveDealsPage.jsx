import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Tag, Search, ShoppingBag, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function ExclusiveDealsPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const [searchQuery, setSearchQuery] = useState('');

  // Curated 60% OFF deals & offer products catalog
  const dealsCatalog = useMemo(() => {
    const curatedDeals = [
      // Groceries & Staples
      { id: 401, name: "Aashirvaad Shudh Chakki Atta 5kg", weight: "5kg", price: 235, mrp: 310, discount: 24, rating: 4.9, reviews: 2450, image: "instant-noodles-hero-transparent.png", category: "groceries", subcat: "staples", brand: "Aashirvaad", inStock: true, stock_quantity: 60 },
      { id: 402, name: "Fortune Sunlite Refined Sunflower Oil 1L Pouch", weight: "1L", price: 135, mrp: 175, discount: 23, rating: 4.8, reviews: 1890, image: "instant-noodles-hero-transparent.png", category: "groceries", subcat: "staples", brand: "Fortune", inStock: true, stock_quantity: 50 },
      { id: 403, name: "Fortune Everyday Premium Basmati Rice 5kg", weight: "5kg", price: 349, mrp: 520, discount: 33, rating: 4.8, reviews: 1340, image: "instant-noodles-hero-transparent.png", category: "groceries", subcat: "staples", brand: "Fortune", inStock: true, stock_quantity: 40 },
      { id: 404, name: "Tata Salt Vacuum Evaporated Iodized Salt 1kg", weight: "1kg", price: 24, mrp: 28, discount: 14, rating: 4.9, reviews: 3100, image: "instant-noodles-hero-transparent.png", category: "groceries", subcat: "staples", brand: "Tata", inStock: true, stock_quantity: 100 },

      // Snacks & Beverages
      { id: 405, name: "Cadbury Dairy Milk Silk Chocolate Bar 150g", weight: "150g", price: 139, mrp: 175, discount: 20, rating: 4.9, reviews: 4200, image: "lays_cream_onion.png", category: "snacks", subcat: "sweets", brand: "Cadbury", inStock: true, stock_quantity: 80 },
      { id: 406, name: "Nescafé Classic Instant Coffee Jar 200g", weight: "200g", price: 549, mrp: 690, discount: 20, rating: 4.9, reviews: 2980, image: "lays_cream_onion.png", category: "beverages", subcat: "coffee", brand: "Nescafé", inStock: true, stock_quantity: 45 },
      { id: 407, name: "Lay's Spanish Tomato Tango Chips (Pack of 3)", weight: "150g", price: 50, mrp: 65, discount: 23, rating: 4.8, reviews: 1950, image: "lays_cream_onion.png", category: "snacks", subcat: "chips", brand: "Lay's", inStock: true, stock_quantity: 75 },
      { id: 408, name: "Real Fruit Power Mixed Fruit Juice 1L Tetra", weight: "1L", price: 99, mrp: 140, discount: 29, rating: 4.8, reviews: 1620, image: "lays_cream_onion.png", category: "beverages", subcat: "juice", brand: "Real", inStock: true, stock_quantity: 50 },

      // Personal Care & Hygiene
      { id: 409, name: "Dove Cream Beauty Bathing Soap (Pack of 4 x 100g)", weight: "400g", price: 199, mrp: 260, discount: 23, rating: 4.9, reviews: 2890, image: "dettol-handwash-real.jpg", category: "personal-care", subcat: "soap", brand: "Dove", inStock: true, stock_quantity: 65 },
      { id: 410, name: "Dettol Antiseptic Liquid Disinfectant 550ml", weight: "550ml", price: 215, mrp: 265, discount: 19, rating: 4.9, reviews: 3450, image: "dettol-handwash-real.jpg", category: "personal-care", subcat: "hygiene", brand: "Dettol", inStock: true, stock_quantity: 70 },
      { id: 411, name: "Colgate Strong Teeth Dental Paste 200g Saver Pack", weight: "200g", price: 110, mrp: 140, discount: 21, rating: 4.8, reviews: 2100, image: "dettol-handwash-real.jpg", category: "personal-care", subcat: "oral", brand: "Colgate", inStock: true, stock_quantity: 85 },

      // Household & Cleaning
      { id: 412, name: "Surf Excel Easy Wash Detergent Powder 1kg", weight: "1kg", price: 135, mrp: 160, discount: 15, rating: 4.8, reviews: 1780, image: "dettol-handwash-real.jpg", category: "household", subcat: "laundry", brand: "Surf Excel", inStock: true, stock_quantity: 60 },
      { id: 413, name: "Vim Dishwash Gel Lemon Liquid 750ml Bottle", weight: "750ml", price: 165, mrp: 205, discount: 20, rating: 4.9, reviews: 2340, image: "dettol-handwash-real.jpg", category: "household", subcat: "cleaning", brand: "Vim", inStock: true, stock_quantity: 55 }
    ];

    const combined = [...curatedDeals];
    products.forEach(p => {
      if (!combined.some(c => c.id === p.id) && p.discount >= 15) {
        combined.push(p);
      }
    });

    return combined;
  }, []);

  const filteredDeals = useMemo(() => {
    return dealsCatalog.filter(p => {
      return !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [dealsCatalog, searchQuery]);

  return (
    <div style={{ backgroundColor: '#F8F6FE', minHeight: '100vh', paddingBottom: '60px', paddingTop: isMobile ? '16px' : '24px' }}>
      {/* Top Search Bar */}
      <div className="container" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search 60% OFF deals, groceries, snacks, soaps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '14px',
              border: '1px solid #D8B4FE',
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
        {filteredDeals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* 💜 SECTION 1: EXCLUSIVE DEALS & OFFERS HERO BANNER */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #E9D5FF', boxShadow: '0 4px 16px rgba(100,0,200,0.06)' }}>
              <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(100,0,200,0.12)' }}>
                <img
                  src="/banner-exclusive-deals.png"
                  alt="Exclusive Deals & Offers - Up to 60% OFF"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F3E8FF', color: '#6B21A8', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Sparkles size={12} color="#6B21A8" />
                  <span>Unbeatable Mega Savings</span>
                </div>
                <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#4C1D95' }}>
                  Exclusive Deals &amp; Offers
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Groceries, Snacks, Beverages, Personal Care &amp; Household Essentials at guaranteed lowest prices.
                </p>
              </div>

              {/* 🛒 ALL DEALS GRID */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: isMobile ? '12px' : '18px'
              }}>
                {filteredDeals.map(product => (
                  <ProductCard key={product.id} product={product} badge={`${product.discount}% OFF`} badgeColor="#6B21A8" />
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #E9D5FF'
          }}>
            <Tag size={48} color="#6B21A8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1F2937' }}>No deal products found</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try searching for another product or resetting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
