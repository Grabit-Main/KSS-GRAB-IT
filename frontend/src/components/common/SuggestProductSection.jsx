import React, { useState } from 'react';
import { CheckCircle2, Send, PackagePlus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { post } from '../../api';

const CATEGORIES = [
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
  'Other / Unsure'
];

export default function SuggestProductSection() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      if (toast?.showToast) toast.showToast('Please enter the product name! 🛍️');
      return;
    }

    setLoading(true);
    const customerPhone = (() => {
      try {
        const u = localStorage.getItem('grabit_user');
        return u ? JSON.parse(u).phone || 'Anonymous' : 'Anonymous';
      } catch {
        return 'Anonymous';
      }
    })();

    const payload = {
      product_name: productName.trim(),
      category,
      brand: brand.trim(),
      notes: notes.trim(),
      customer_phone: customerPhone
    };

    try {
      // 1. Post to backend API
      await post('/product-suggestions', payload);
      
      // 2. Also keep a copy in local localStorage for offline/demo robustness
      const existing = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      localStorage.setItem('grabit_product_suggestions', JSON.stringify([
        { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() },
        ...existing
      ]));
      
      setSubmitted(true);
      if (toast?.showToast) toast.showToast('🎉 Suggestion submitted! Our admin team will look into adding it.');
    } catch (err) {
      console.warn('Suggestions post failed, falling back to localStorage:', err);
      
      // Fallback local storage
      const existing = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      localStorage.setItem('grabit_product_suggestions', JSON.stringify([
        { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() },
        ...existing
      ]));
      
      setSubmitted(true);
      if (toast?.showToast) toast.showToast('🎉 Suggestion saved locally! Thank you for helping us grow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #E2E8F0',
      padding: '28px 24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
      margin: '24px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Accent Stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'linear-gradient(90deg, #0071E3 0%, #38BDF8 50%, #10B981 100%)'
      }} />

      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <PackagePlus size={22} color="#0071E3" />
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>
            Suggest a Product
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          Can't find a product in our store? Let us know what you need, and we'll stock it for you!
        </p>
      </div>

      {submitted ? (
        <div style={{
          background: '#F0FDF4', borderRadius: '18px', border: '1px solid #BBF7D0',
          padding: '24px', textAlign: 'center', color: '#166534'
        }}>
          <CheckCircle2 size={44} color="#16A34A" style={{ marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900 }}>Suggestion Received! 🚀</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#15803D' }}>
            Our admin team has received your request to add <strong>"{productName}"</strong>. We will notify you when it's stocked!
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setProductName('');
              setBrand('');
              setNotes('');
            }}
            style={{
              background: '#FFFFFF', border: '1px solid #86EFAC', color: '#15803D',
              borderRadius: '12px', padding: '8px 18px', fontSize: '12px', fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Suggest Another Product
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                Product Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Nutella Spread 350g, Coca-Cola Zero Sugar"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 600,
                  outline: 'none', background: '#F8FAFC', color: '#0F172A',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateRows: 'auto', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 600,
                    outline: 'none', background: '#F8FAFC', color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Ferrero, Coca-Cola"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 600,
                    outline: 'none', background: '#F8FAFC', color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                Any specific variant, size or comments? (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe size, flavor, pack count or details..."
                rows={2}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 600,
                  outline: 'none', background: '#F8FAFC', color: '#0F172A',
                  fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#0071E3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              boxShadow: '0 4px 12px rgba(0,113,227,0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      )}
    </div>
  );
}
