import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Lightbulb, CheckCircle2, PackagePlus, Clock, Tag, MessageSquare, ChevronRight } from 'lucide-react';
import { post } from '../../api';
import { useToast } from '../../context/ToastContext';

const CATEGORIES_LIST = [
  'Snacks & Munchies',
  'Dairy & Bakery',
  'Cold Drinks & Juices',
  'Atta, Rice & Dal',
  'Chocolates & Sweets',
  'Personal Care',
  'Household Essentials',
  'Fresh Fruits & Veggies',
  'Tea, Coffee & Drinks',
  'Biscuits & Cookies',
  'Instant & Frozen Food',
  'Edible Oils & Ghee',
  'Electronics & Gadgets',
  'Fashion & Accessories',
  'Other / General'
];

export function getLocalProductSuggestions() {
  try {
    const raw = localStorage.getItem('grabit_product_suggestions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalProductSuggestion(suggestion) {
  try {
    const existing = getLocalProductSuggestions();
    const updated = [suggestion, ...existing];
    localStorage.setItem('grabit_product_suggestions', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grabit_product_suggestion_added'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch {}
}

export default function ProductSuggestionModal({ isOpen, onClose, prefillQuery = '', prefillCategory = '' }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('suggest'); // 'suggest' | 'my-requests'
  
  const [productName, setProductName] = useState(prefillQuery);
  const [category, setCategory] = useState(prefillCategory || 'Snacks & Munchies');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mySuggestions, setMySuggestions] = useState([]);

  useEffect(() => {
    if (prefillQuery) setProductName(prefillQuery);
    if (prefillCategory) setCategory(prefillCategory);
  }, [prefillQuery, prefillCategory, isOpen]);

  useEffect(() => {
    const loadMySuggestions = () => {
      setMySuggestions(getLocalProductSuggestions());
    };
    loadMySuggestions();
    window.addEventListener('grabit_product_suggestion_added', loadMySuggestions);
    window.addEventListener('storage', loadMySuggestions);
    return () => {
      window.removeEventListener('grabit_product_suggestion_added', loadMySuggestions);
      window.removeEventListener('storage', loadMySuggestions);
    };
  }, [isOpen]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      if (user.phone) setContact(user.phone);
    } catch {}
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      showToast('Please enter the product name you would like us to stock.');
      return;
    }

    setIsSubmitting(true);

    const newSuggestion = {
      id: `sug-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      product_name: productName.trim(),
      category: category || 'General',
      brand: brand.trim(),
      notes: notes.trim(),
      customer_phone: contact.trim() || 'Anonymous Customer',
      created_at: new Date().toISOString(),
      status: 'Under Review'
    };

    // Save locally
    saveLocalProductSuggestion(newSuggestion);

    // Post to backend API endpoint if available
    try {
      await post('/product-suggestions', {
        product_name: newSuggestion.product_name,
        category: newSuggestion.category,
        brand: newSuggestion.brand,
        notes: newSuggestion.notes,
        customer_phone: newSuggestion.customer_phone
      });
    } catch (err) {
      console.warn('Backend product suggestion sync fallback:', err);
    }

    setIsSubmitting(false);
    showToast(`Thank you! We've recorded your suggestion for "${productName.trim()}". Our team will try to stock it soon!`);
    
    // Reset form & switch to my-requests tab
    setProductName('');
    setBrand('');
    setNotes('');
    setActiveTab('my-requests');
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '520px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
          borderRadius: '24px 24px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: '#0071E3', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)'
            }}>
              <Lightbulb size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Suggest a Product
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                Can't find an item? Request it and we'll stock it for you!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748B', transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            type="button"
            onClick={() => setActiveTab('suggest')}
            style={{
              flex: 1, padding: '12px', fontSize: '13px', fontWeight: 800,
              background: activeTab === 'suggest' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'suggest' ? '#0071E3' : '#64748B',
              border: 'none', borderBottom: activeTab === 'suggest' ? '2px solid #0071E3' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <PackagePlus size={15} />
            <span>New Suggestion</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-requests')}
            style={{
              flex: 1, padding: '12px', fontSize: '13px', fontWeight: 800,
              background: activeTab === 'my-requests' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'my-requests' ? '#0071E3' : '#64748B',
              border: 'none', borderBottom: activeTab === 'my-requests' ? '2px solid #0071E3' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Clock size={15} />
            <span>My Requests ({mySuggestions.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {activeTab === 'suggest' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Product Name Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Product Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oat Milk 1L, Doritos Cool Ranch, Organic Honey..."
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  style={{
                    width: '100%', height: '42px', borderRadius: '12px',
                    border: '1.5px solid #CBD5E1', padding: '0 14px',
                    fontSize: '13.5px', fontWeight: 600, color: '#0F172A',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0071E3'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              {/* Category Dropdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{
                      width: '100%', height: '42px', borderRadius: '12px',
                      border: '1.5px solid #CBD5E1', padding: '0 12px',
                      fontSize: '13px', fontWeight: 700, color: '#0F172A',
                      outline: 'none', background: '#FFFFFF', boxSizing: 'border-box'
                    }}
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Brand / Variant Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    Brand / Variant <span style={{ color: '#94A3B8', fontWeight: 500 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oatly, Amul, 500g"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    style={{
                      width: '100%', height: '42px', borderRadius: '12px',
                      border: '1.5px solid #CBD5E1', padding: '0 14px',
                      fontSize: '13.5px', fontWeight: 600, color: '#0F172A',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Notes / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Additional Notes / Details <span style={{ color: '#94A3B8', fontWeight: 500 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why you want this product or any specific packaging details..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: '100%', borderRadius: '12px',
                    border: '1.5px solid #CBD5E1', padding: '10px 14px',
                    fontSize: '13px', fontWeight: 500, color: '#0F172A',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Your Phone / Contact <span style={{ color: '#94A3B8', fontWeight: 500 }}>(To notify you when stocked)</span>
                </label>
                <input
                  type="text"
                  placeholder="+919999900004"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  style={{
                    width: '100%', height: '42px', borderRadius: '12px',
                    border: '1.5px solid #CBD5E1', padding: '0 14px',
                    fontSize: '13.5px', fontWeight: 600, color: '#0F172A',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', height: '46px', marginTop: '6px',
                  background: '#0071E3', color: '#FFFFFF',
                  borderRadius: '14px', border: 'none',
                  fontSize: '14px', fontWeight: 900,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 113, 227, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => !isSubmitting && (e.currentTarget.style.transform = 'none')}
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Product Suggestion'}</span>
              </button>
            </form>
          ) : (
            /* My Suggestions History Tab */
            <div>
              {mySuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                  <PackagePlus size={48} color="#94A3B8" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    No product suggestions submitted yet
                  </h4>
                  <p style={{ fontSize: '13px', margin: 0 }}>
                    When you request a product that is not in store, it will appear here with live updates.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('suggest')}
                    style={{
                      marginTop: '16px', background: '#EFF6FF', color: '#0071E3',
                      border: '1px solid #BFDBFE', borderRadius: '10px',
                      padding: '8px 18px', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    + Suggest a Product Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mySuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      style={{
                        background: '#F8FAFC', borderRadius: '14px',
                        border: '1px solid #E2E8F0', padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                          {sug.product_name}
                        </h4>
                        <span style={{
                          background: sug.status === 'Stocked' ? '#DCFCE7' : '#FEF3C7',
                          color: sug.status === 'Stocked' ? '#15803D' : '#B45309',
                          fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          <CheckCircle2 size={12} />
                          {sug.status || 'Under Review'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                        <span>Category: {sug.category}</span>
                        {sug.brand && <span>Brand: {sug.brand}</span>}
                      </div>
                      {sug.notes && (
                        <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0', fontStyle: 'italic' }}>
                          "{sug.notes}"
                        </p>
                      )}
                      <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '4px' }}>
                        Submitted on {new Date(sug.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
