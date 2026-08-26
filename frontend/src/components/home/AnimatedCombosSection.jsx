import { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Plus, Check, ShoppingBag } from 'lucide-react';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import ProductSvg from '../common/ProductSvg';

const COMBOS_DATA = [
  {
    id: 'combo-staples',
    category: 'staples',
    title: '🌾 Daily Essentials Pack',
    subtitle: "Aashirvaad Atta 5kg + Fortune Oil 1L",
    itemIds: [72, 73],
    price: 375,
    mrp: 460,
    savings: 'SAVE ₹85',
    discountPct: '18% OFF',
    tag: '🌾 Staples Special',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    border: '#FDBA74',
    badgeColor: '#D97706',
    accentColor: '#EA580C',
    img: '/combo-staples.jpg'
  },
  {
    id: 'combo-tea',
    category: 'breakfast',
    title: '☕ Royal Tea-Time Combo',
    subtitle: "Tata Tea Gold 500g + Wheat Bread",
    itemIds: [64, 28],
    price: 345,
    mrp: 410,
    savings: 'SAVE ₹65',
    discountPct: '16% OFF',
    tag: '☕ Tea Lover',
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    border: '#FCD34D',
    badgeColor: '#B45309',
    accentColor: '#D97706',
    img: '/combo-tea.jpg'
  },
  {
    id: 'combo-hygiene',
    category: 'hygiene',
    title: '🧼 Home Hygiene Super Saver',
    subtitle: "Dettol Handwash + Dove Soap 3-Pack",
    itemIds: [118, 120],
    price: 260,
    mrp: 325,
    savings: 'SAVE ₹65',
    discountPct: '20% OFF',
    tag: '🛡️ 100% Protection',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    border: '#86EFAC',
    badgeColor: '#059669',
    accentColor: '#16A34A',
    img: '/combo-hygiene.jpg'
  },
  {
    id: 'combo-cheese',
    category: 'breakfast',
    title: '🍕 Pizza & Cheese Party Combo',
    subtitle: "Amul Mozzarella + Fresh Paneer 200g",
    itemIds: [32, 27],
    price: 199,
    mrp: 240,
    savings: 'SAVE ₹41',
    discountPct: '17% OFF',
    tag: '🧀 Dairy Fresh',
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    border: '#93C5FD',
    badgeColor: '#0066FF',
    accentColor: '#2563EB',
    img: '/combo-cheese.jpg'
  },
  {
    id: 'combo-munchies',
    category: 'munchies',
    title: '🍿 Midnight Craving Munchies',
    subtitle: "Pringles Can 107g + Thums Up 750ml",
    itemIds: [9, 48],
    price: 145,
    mrp: 180,
    savings: 'SAVE ₹35',
    discountPct: '19% OFF',
    tag: '🍿 Party Combo',
    gradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
    border: '#D8B4FE',
    badgeColor: '#7E22CE',
    accentColor: '#9333EA',
    img: '/combo-munchies.jpg'
  },
  {
    id: 'combo-sweets',
    category: 'sweets',
    title: '🎁 Festive Mithai Celebration',
    subtitle: "Haldiram Gulab Jamun 1kg + Cadbury Pack",
    itemIds: [113, 101],
    price: 335,
    mrp: 410,
    savings: 'SAVE ₹75',
    discountPct: '18% OFF',
    tag: '🪔 Festive Special',
    gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
    border: '#FCA5A5',
    badgeColor: '#E11D48',
    accentColor: '#F43F5E',
    img: '/combo-sweets.jpg'
  }
];

export default function AnimatedCombosSection({ isMobile }) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('all');
  const [addedComboId, setAddedComboId] = useState(null);
  const [selectedComboModal, setSelectedComboModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const scrollRef = useRef(null);

  const filteredCombos = activeTab === 'all'
    ? COMBOS_DATA
    : COMBOS_DATA.filter(c => c.category === activeTab);

  // Auto-scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: isMobile ? 260 : 320, behavior: 'smooth' });
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [isMobile, activeTab]);

  const handleAddCombo = (combo, e) => {
    if (e) e.stopPropagation();
    combo.itemIds.forEach(id => {
      const prod = products.find(p => p.id === id);
      if (prod) addItem(prod);
    });
    setAddedComboId(combo.id);
    setTimeout(() => {
      setAddedComboId(null);
    }, 1500);
  };

  return (
    <div className="container" style={{ paddingTop: '8px', marginBottom: isMobile ? '16px' : '24px' }}>
      
      {/* 🚀 ANIMATED HEADER STRIP */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '8px', marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #0066FF, #0043A8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,102,255,0.3)'
          }}>
            <Zap size={16} fill="#FFFFFF" color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>EXPRESS COMBOS & SAVINGS BUNDLES</span>
              <span style={{
                background: '#EF4444', color: '#FFFFFF', fontSize: '9.5px',
                fontWeight: 900, padding: '1px 6px', borderRadius: '6px'
              }}>
                LIVE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              1-Tap Add Real Grocery Combos • Save Up to ₹85 Daily
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: '🔥 All Combos' },
            { id: 'staples', label: '🌾 Staples' },
            { id: 'breakfast', label: '☕ Breakfast & Dairy' },
            { id: 'munchies', label: '🍿 Munchies' },
            { id: 'hygiene', label: '🧼 Hygiene' },
            { id: 'sweets', label: '🎁 Sweets' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? '#0066FF' : '#F1F5F9',
                color: activeTab === t.id ? '#FFFFFF' : '#475569',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 ANIMATED SCROLLING COMBOS ROW */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: '12px', overflowX: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          paddingBottom: '8px', paddingTop: '2px'
        }}
      >
        {filteredCombos.map((combo) => (
          <div
            key={combo.id}
            onClick={() => setSelectedComboModal(combo)}
            style={{
              background: combo.gradient,
              border: `1.5px solid ${combo.border}`,
              borderRadius: '18px',
              padding: '12px 14px',
              minWidth: isMobile ? '270px' : '320px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,102,255,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
            }}
          >
            {/* Badge Tag */}
            <div style={{
              position: 'absolute', top: '8px', right: '10px',
              background: '#FFFFFF', color: combo.badgeColor,
              border: `1px solid ${combo.border}`,
              padding: '2px 8px', borderRadius: '12px',
              fontSize: '9.5px', fontWeight: 900, letterSpacing: '0.3px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {combo.savings}
            </div>

            {/* PRODUCT THUMBNAIL BOX */}
            <div style={{
              width: '74px', height: '74px', borderRadius: '16px',
              background: '#FFFFFF', border: `1.5px solid ${combo.border}`,
              position: 'relative', overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
            }}>
              <img
                src={combo.img}
                alt={combo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* DETAILS & ACTIONS */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '2px' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, color: combo.badgeColor, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                {combo.tag} • {combo.discountPct}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {combo.title}
              </div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {combo.subtitle}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>₹{combo.price}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{combo.mrp}</span>
                </div>

                <button
                  onClick={(e) => handleAddCombo(combo, e)}
                  style={{
                    background: addedComboId === combo.id ? '#10B981' : combo.badgeColor,
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {addedComboId === combo.id ? (
                    <>
                      <Check size={13} />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Add Combo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: '#0F172A', color: '#FFFFFF', padding: '10px 18px',
          borderRadius: '30px', fontSize: '12px', fontWeight: 800, zIndex: 10000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <ShoppingBag size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* BUNDLE INSPECTOR MODAL */}
      {selectedComboModal && (
        <div
          onClick={() => setSelectedComboModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: '24px',
              maxWidth: '460px', width: '100%', padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setSelectedComboModal(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#F1F5F9', color: '#0F172A', border: 'none',
                fontSize: '16px', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                overflow: 'hidden', background: selectedComboModal.gradient,
                border: `1.5px solid ${selectedComboModal.border}`,
                flexShrink: 0
              }}>
                <img src={selectedComboModal.img} alt={selectedComboModal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 900, color: selectedComboModal.badgeColor, letterSpacing: '0.4px' }}>
                  {selectedComboModal.savings} • {selectedComboModal.discountPct}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0' }}>
                  {selectedComboModal.title}
                </h3>
              </div>
            </div>

            {/* Included Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                2 Items Included in this Combo:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedComboModal.itemIds.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '12px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #CBD5E1', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProductSvg name={prod.image} size={42} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: '1.3' }}>{prod.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Net Wt: {prod.weight}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>₹{prod.price}</div>
                        <div style={{ fontSize: '10.5px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{prod.mrp}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ background: 'linear-gradient(135deg, #EEF4FF 0%, #E0EDFF 100%)', padding: '14px', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Original Total: <span style={{ textDecoration: 'line-through' }}>₹{selectedComboModal.mrp}</span></div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0066FF' }}>₹{selectedComboModal.price} <span style={{ fontSize: '11px', color: '#059669', fontWeight: 800 }}>({selectedComboModal.savings})</span></div>
                </div>
                <Sparkles size={24} color="#0066FF" />
              </div>

              <button
                onClick={(e) => {
                  handleAddCombo(selectedComboModal, e);
                  setSelectedComboModal(null);
                }}
                style={{
                  width: '100%', background: '#0066FF', color: '#FFFFFF',
                  border: 'none', padding: '12px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,102,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <span>🛒 Add Combo Pack to Cart — ₹{selectedComboModal.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
