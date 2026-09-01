import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, HeartPulse, Clock, ChevronRight, Search, FileText, CheckCircle2, PhoneCall, Award } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function PharmacyPage() {
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);

  // Pharmacy & Wellness items
  const pharmacyProducts = useMemo(() => {
    const base = products.filter(p => p.category === 'personal-care' || p.name.toLowerCase().includes('dettol') || p.name.toLowerCase().includes('soap') || p.name.toLowerCase().includes('toothpaste'));
    
    // Add specific pharmacy items
    const extraPharmacyItems = [
      { id: 201, name: "Vicks VapoRub Balm 50g Relief from Cold", weight: "50g", price: 155, mrp: 175, discount: 11, rating: 4.9, reviews: 1240, image: "dettol-handwash-real.jpg", category: "pharmacy", subcat: "cold", brand: "Vicks", inStock: true, stock_quantity: 60 },
      { id: 202, name: "Moov Fast Pain Relief Ointment 50g", weight: "50g", price: 165, mrp: 190, discount: 13, rating: 4.8, reviews: 980, image: "dettol-handwash-real.jpg", category: "pharmacy", subcat: "pain", brand: "Moov", inStock: true, stock_quantity: 45 },
      { id: 203, name: "Eno Fizzy Lemon Fast Relief Sachets (Pack of 6)", weight: "30g", price: 60, mrp: 72, discount: 17, rating: 4.9, reviews: 1450, image: "dettol-handwash-real.jpg", category: "pharmacy", subcat: "digestive", brand: "Eno", inStock: true, stock_quantity: 80 },
      { id: 204, name: "Revital H Daily Health Supplement 30 Capsules", weight: "30 Caps", price: 310, mrp: 360, discount: 14, rating: 4.8, reviews: 760, image: "dettol-handwash-real.jpg", category: "pharmacy", subcat: "vitamins", brand: "Revital", inStock: true, stock_quantity: 35 },
      { id: 205, name: "Hansaplast Waterproof First Aid Bandages (20 Pcs)", weight: "20 Pcs", price: 75, mrp: 90, discount: 17, rating: 4.9, reviews: 1120, image: "dettol-handwash-real.jpg", category: "pharmacy", subcat: "firstaid", brand: "Hansaplast", inStock: true, stock_quantity: 90 }
    ];

    const combined = [...base];
    extraPharmacyItems.forEach(item => {
      if (!combined.some(p => p.id === item.id)) combined.push(item);
    });

    return combined;
  }, []);

  const subcategories = [
    { id: 'all', label: '🏥 All Pharmacy & Wellness', icon: '💊' },
    { id: 'cold', label: '🤧 Cold, Cough & Flu', icon: '🧊' },
    { id: 'pain', label: '⚡ Pain Relief & Ointments', icon: '🩹' },
    { id: 'digestive', label: '🍋 Antacids & Digestion', icon: '🧪' },
    { id: 'firstaid', label: '🩹 First Aid & Hygiene', icon: '🧼' },
    { id: 'vitamins', label: '💊 Vitamins & Supplements', icon: '🌿' }
  ];

  const filteredProducts = useMemo(() => {
    return pharmacyProducts.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedSubcat === 'all') return matchSearch;
      if (selectedSubcat === 'cold') return matchSearch && (p.name.toLowerCase().includes('vicks') || p.subcat === 'cold');
      if (selectedSubcat === 'pain') return matchSearch && (p.name.toLowerCase().includes('moov') || p.subcat === 'pain');
      if (selectedSubcat === 'digestive') return matchSearch && (p.name.toLowerCase().includes('eno') || p.subcat === 'digestive');
      if (selectedSubcat === 'firstaid') return matchSearch && (p.name.toLowerCase().includes('dettol') || p.name.toLowerCase().includes('hansaplast') || p.subcat === 'firstaid');
      if (selectedSubcat === 'vitamins') return matchSearch && (p.name.toLowerCase().includes('revital') || p.subcat === 'vitamins');
      return matchSearch;
    });
  }, [pharmacyProducts, selectedSubcat, searchQuery]);

  return (
    <div style={{ backgroundColor: '#FBF9FE', minHeight: '100vh', paddingBottom: '60px', paddingTop: isMobile ? '16px' : '24px' }}>
      {/* Top Search Bar */}
      <div className="container" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search medicines, cough syrup, pain relief, vitamins..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: '14px',
              border: '1px solid #E9D5FF',
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
        {filteredProducts.length > 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: isMobile ? '16px' : '24px', border: '1px solid #E9D5FF', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            {/* 🏥 Embedded Pharmacy Hero Graphic Banner */}
            <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
              <img
                src="/banner-pharmacy.png"
                alt="Pharmacy at your doorstep - Trusted Care Delivered"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#581C87', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💊 Pharmacy &amp; Health Essentials
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                100% Genuine OTC medicines, syrups, pain relief &amp; wellness items delivered with care.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: isMobile ? '12px' : '18px'
            }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #F3E8FF'
          }}>
            <ShoppingBag size={48} color="#6B21A8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1F2937' }}>No medicines found</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try searching for another product or resetting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
