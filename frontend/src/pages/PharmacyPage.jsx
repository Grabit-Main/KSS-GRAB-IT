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
    <div style={{ backgroundColor: '#FBF9FE', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Breadcrumb Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E9D5FF', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
          <Link to="/" style={{ color: '#6B21A8', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
          <ChevronRight size={14} color="#999" />
          <span style={{ color: '#1F2937', fontWeight: 700 }}>Pharmacy at your Doorstep</span>
        </div>
      </div>

      {/* Emergency Delivery Alert Bar */}
      <div style={{ background: 'linear-gradient(90deg, #6B21A8 0%, #4C1D95 100%)', color: '#FFFFFF', padding: '10px 0', fontSize: '13px', fontWeight: 600 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textAlign: 'center' }}>
          <Clock size={18} color="#FDE047" />
          <span>⚡ Emergency Medicines Needed? <strong>10-Minute Express Delivery Available 24/7</strong></span>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="container" style={{ marginTop: isMobile ? '12px' : '24px' }}>
        <div style={{
          borderRadius: isMobile ? '16px' : '24px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(107, 33, 168, 0.14)',
          border: '1.5px solid rgba(168, 85, 247, 0.25)',
          background: '#FFFFFF'
        }}>
          <img
            src="/banner-pharmacy.png"
            alt="Pharmacy at your doorstep - Trusted Care Delivered"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>

      {/* Prescription & Help Cards Row */}
      <div className="container" style={{ marginTop: isMobile ? '16px' : '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '16px'
        }}>
          {/* Prescription Upload Card */}
          <div style={{
            background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #D8B4FE',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FileText color="#FFFFFF" size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#4C1D95' }}>Have a Prescription?</h3>
              <p style={{ margin: '4px 0 10px', fontSize: '12.5px', color: '#6B21A8' }}>Upload your doctor's note and we'll dispense your exact medicines.</p>
              <button
                onClick={() => setPrescriptionUploaded(true)}
                style={{
                  background: '#6B21A8',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {prescriptionUploaded ? '✓ Uploaded Successfully!' : '📷 Upload Prescription'}
              </button>
            </div>
          </div>

          {/* Pharmacist Consultation Card */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <PhoneCall color="#FFFFFF" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1E40AF' }}>Free Pharmacist Consultation</h3>
              <p style={{ margin: '4px 0 8px', fontSize: '12.5px', color: '#1E3A8A' }}>Speak to licensed pharmacists for dosage guidance & advice.</p>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1D4ED8' }}>📞 Toll-Free: 1800-419-8080</span>
            </div>
          </div>
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
          border: '1px solid #F3E8FF',
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
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#581C87', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💊 Pharmacy & Health Essentials
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                100% Genuine OTC medicines, syrups, pain relief & wellness delivered with care.
              </p>
            </div>

            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search medicines or products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  border: '1px solid #D8B4FE',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
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
                  border: selectedSubcat === cat.id ? '2px solid #6B21A8' : '1px solid #E9D5FF',
                  background: selectedSubcat === cat.id ? '#F3E8FF' : '#FFFFFF',
                  color: selectedSubcat === cat.id ? '#6B21A8' : '#4B5563',
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
            border: '1px solid #F3E8FF'
          }}>
            <ShoppingBag size={48} color="#6B21A8" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1F2937' }}>No medicines found in this filter</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Try searching for another product or reset your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
