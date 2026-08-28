import React, { useState } from 'react';
import { CheckCircle2, Send, PackagePlus, ChevronDown, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { post } from '../../api';

const CATEGORIES = [
  { label: 'Snacks & Munchies',        emoji: '🍿' },
  { label: 'Dairy & Bakery',           emoji: '🥛' },
  { label: 'Cold Drinks & Juices',     emoji: '🥤' },
  { label: 'Atta, Rice & Dal',         emoji: '🌾' },
  { label: 'Chocolates & Sweets',      emoji: '🍫' },
  { label: 'Personal Care',            emoji: '🧴' },
  { label: 'Household Essentials',     emoji: '🏠' },
  { label: 'Fresh Fruits & Veggies',   emoji: '🥦' },
  { label: 'Tea, Coffee & Drinks',     emoji: '☕' },
  { label: 'Biscuits & Cookies',       emoji: '🍪' },
  { label: 'Instant & Frozen Food',    emoji: '🍱' },
  { label: 'Edible Oils & Ghee',       emoji: '🫙' },
  { label: 'Electronics & Gadgets',    emoji: '📱' },
  { label: 'Fashion & Accessories',    emoji: '👗' },
  { label: 'Other / Unsure',           emoji: '📦' },
];

/** Custom mobile-safe bottom-sheet category picker */
function CategoryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORIES.find((c) => c.label === value) || CATEGORIES[0];

  const pick = (cat) => {
    onChange(cat.label);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '12px',
          border: '1.5px solid #CBD5E1',
          background: '#F8FAFC',
          color: '#0F172A',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          boxSizing: 'border-box',
          textAlign: 'left',
          gap: '8px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>{selected.emoji}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.label}
          </span>
        </span>
        <ChevronDown size={16} color="#64748B" style={{ flexShrink: 0 }} />
      </button>

      {/* Bottom-sheet modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.50)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '78vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
            </div>

            {/* Sheet header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px 14px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                Choose a Category
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <X size={16} color="#475569" />
              </button>
            </div>

            {/* Options list */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px 24px' }}>
              {CATEGORIES.map((cat) => {
                const isSelected = cat.label === value;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => pick(cat)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '13px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #0071E3' : '1.5px solid transparent',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      color: isSelected ? '#0071E3' : '#0F172A',
                      fontSize: '14px',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '3px',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <span style={{ fontSize: '22px', width: '30px', textAlign: 'center', flexShrink: 0 }}>
                      {cat.emoji}
                    </span>
                    <span style={{ flex: 1 }}>{cat.label}</span>
                    {isSelected && (
                      <span style={{ color: '#0071E3', fontSize: '16px', fontWeight: 900 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SuggestProductSection() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].label);
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
      await post('/product-suggestions', payload);
      const existing = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      localStorage.setItem('grabit_product_suggestions', JSON.stringify([
        { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() },
        ...existing
      ]));
      setSubmitted(true);
      if (toast?.showToast) toast.showToast('🎉 Suggestion submitted! Our team will review it soon.');
    } catch (err) {
      console.warn('Suggestions post failed, falling back to localStorage:', err);
      const existing = JSON.parse(localStorage.getItem('grabit_product_suggestions') || '[]');
      localStorage.setItem('grabit_product_suggestions', JSON.stringify([
        { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() },
        ...existing
      ]));
      setSubmitted(true);
      if (toast?.showToast) toast.showToast('🎉 Suggestion saved! Thank you for helping us grow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      padding: '20px 16px 22px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      margin: '16px 0',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Top Accent Stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #0071E3 0%, #38BDF8 60%, #10B981 100%)'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
        <div style={{
          background: '#EFF6FF', borderRadius: '12px', padding: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <PackagePlus size={20} color="#0071E3" />
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: '0 0 3px 0', fontSize: '17px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.2px' }}>
            Suggest a Product
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 500, lineHeight: '1.5' }}>
            Can't find what you need? Tell us — we'll stock it for you!
          </p>
        </div>
      </div>

      {submitted ? (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          borderRadius: '16px',
          border: '1px solid #BBF7D0',
          padding: '24px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '44px', marginBottom: '8px' }}>🎉</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 900, color: '#15803D' }}>
            Suggestion Received!
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
            Our team will review your request to add <strong>"{productName}"</strong>. Thank you!
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setProductName('');
              setBrand('');
              setNotes('');
              setCategory(CATEGORIES[0].label);
            }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #86EFAC',
              color: '#15803D',
              borderRadius: '10px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Suggest Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

          {/* Product Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Product Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Nutella Spread 350g"
              required
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: 600,
                outline: 'none', background: '#F8FAFC', color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category — custom mobile-safe bottom-sheet picker */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Category
            </label>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          {/* Brand */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Brand <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'none' }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Ferrero, Coca-Cola"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: 600,
                outline: 'none', background: '#F8FAFC', color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Details <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'none' }}>(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Size, flavor, pack count or any other details..."
              rows={2}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid #CBD5E1', fontSize: '14px', fontWeight: 600,
                outline: 'none', background: '#F8FAFC', color: '#0F172A',
                fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#94A3B8' : 'linear-gradient(135deg, #0071E3 0%, #0058B4 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              boxShadow: loading ? 'none' : '0 6px 16px rgba(0,113,227,0.25)',
              transition: 'all 0.15s ease',
              marginTop: '4px',
              boxSizing: 'border-box',
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
