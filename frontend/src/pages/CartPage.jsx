import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Pencil, Plus, Minus, Trash2, Tag, ChevronRight, X, CheckCircle2, Navigation, Lock, Clock, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductSvg from '../components/common/ProductSvg';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';
import { forceScrollToTop } from '../utils/scrollToTop';
import {
  DEFAULT_CUSTOMER_ADDRESSES,
  loadCustomerAddresses,
  saveCustomerAddresses,
  getCustomerAddressKey
} from '../utils/addressManager';

export default function CartPage() {
  const {
    items, updateQty, removeItem, itemTotal, discount, deliveryFee, toPay, totalItems,
    appliedCoupon, couponDiscount, applyCoupon, removeCoupon, AVAILABLE_COUPONS
  } = useCart();
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  const recommended = products.slice(0, 6);
  const w = useWindowWidth();
  const isMobile = w <= 640;

  useEffect(() => {
    forceScrollToTop();
  }, []);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponInputCode, setCouponInputCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  // Check login state
  const getStoredUser = () => {
    try {
      const u = localStorage.getItem('grabit_user');
      const session = localStorage.getItem('grabit_session');
      return session && u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };
  const activeUser = getStoredUser();
  const isLoggedIn = Boolean(activeUser);

  const handleLoginToProceed = () => {
    sessionStorage.setItem('grabit_intended_path', '/checkout');
    navigate('/login');
  };

  const handleApplyCouponCode = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
      showToast(res.message);
      setTimeout(() => {
        setIsCouponModalOpen(false);
        setCouponFeedback(null);
        setCouponInputCode('');
      }, 700);
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  const getAddressesKey = (phone) => getCustomerAddressKey(phone || activeUser?.phone);
  const loadUserAddresses = () => loadCustomerAddresses(activeUser?.phone);

  const [savedAddresses, setSavedAddresses] = useState(loadUserAddresses);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingAddrIndex, setEditingAddrIndex] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');

  const [customAddressInput, setCustomAddressInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Sync addresses across windows or another tab
  useEffect(() => {
    const syncAddresses = () => {
      setSavedAddresses(loadCustomerAddresses(activeUser?.phone));
    };
    window.addEventListener('grabit_addresses_updated', syncAddresses);
    window.addEventListener('storage', syncAddresses);
    return () => {
      window.removeEventListener('grabit_addresses_updated', syncAddresses);
      window.removeEventListener('storage', syncAddresses);
    };
  }, [activeUser?.phone]);

  const saveAddressesToStorage = (newList) => {
    setSavedAddresses(newList);
    saveCustomerAddresses(newList, activeUser?.phone);
  };

  const defaultAddrObj = savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null;
  const currentAddressText = defaultAddrObj ? `${defaultAddrObj.address}, ${defaultAddrObj.city || ''}`.trim() : '';

  const handleSelectAddress = (addrId) => {
    const updated = savedAddresses.map(a => ({ ...a, isDefault: a.id === addrId }));
    saveAddressesToStorage(updated);
    setIsLocationModalOpen(false);
    showToast('Delivery address updated!');
  };

  const handleStartEdit = (index, e) => {
    e.stopPropagation();
    const target = savedAddresses[index];
    setEditingAddrIndex(index);
    setEditTitle(target.title);
    setEditAddress(target.address);
    setEditCity(target.city || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingAddrIndex === null) return;
    const updated = [...savedAddresses];
    updated[editingAddrIndex] = {
      ...updated[editingAddrIndex],
      title: editTitle.trim() || 'Address',
      address: editAddress.trim(),
      city: editCity.trim()
    };
    saveAddressesToStorage(updated);
    setEditingAddrIndex(null);
    showToast('Address updated!');
  };

  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detected = `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number ? `${addr.house_number}, ` : '';
            const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || '';
            const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Bengaluru';
            const postcode = addr.postcode ? ` ${addr.postcode}` : '';

            const parts = [house ? `${house}${road}` : road, area, `${city}${postcode}`].filter(Boolean);
            if (parts.length > 0) {
              detected = parts.join(', ');
            } else if (data.display_name) {
              detected = data.display_name.split(',').slice(0, 4).join(', ').trim();
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }
        setCustomAddressInput(detected);
        setIsLocating(false);
        showToast('GPS location detected!');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        showToast('Could not access GPS. Please enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveCustomLocation = () => {
    if (!customAddressInput.trim()) {
      showToast('Please enter a location address!');
      return;
    }
    const customText = customAddressInput.trim();
    const newAddrObj = {
      id: Date.now(),
      title: 'Custom Location',
      address: customText,
      city: 'Bengaluru',
      isDefault: true
    };
    const updated = savedAddresses.map(a => ({ ...a, isDefault: false }));
    updated.unshift(newAddrObj);
    saveAddressesToStorage(updated);

    setCustomAddressInput('');
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${customText}"!`);
  };

  return (
    <div className="container section" style={{ paddingTop: isMobile ? '36px' : '44px', paddingBottom: isMobile ? '100px' : '40px' }}>

      {/* Header */}
      <div style={{ marginBottom: '14px', marginTop: isMobile ? '8px' : '12px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: 900, color: '#111827', margin: 0 }}>
          Cart ({totalItems} Items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-state card card-body" style={{ padding: isMobile ? '32px 16px' : '48px', textAlign: 'center', borderRadius: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>Your cart is empty</h3>
          <p style={{ color: '#64748B', marginBottom: '20px' }}>Add items from the store to continue shopping</p>
          <Link to="/" className="btn btn-primary" style={{ minHeight: '44px', background: '#0071E3', borderRadius: '12px', fontWeight: 900, textDecoration: 'none' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
          
          {/* 1. COUPONS & OFFERS CARD */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #F3F4F6',
              padding: '16px 18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827', marginBottom: '12px' }}>
              Coupons &amp; offers
            </div>

            {!isLoggedIn ? (
              /* Locked Coupons Overlay */
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#FAF5FF',
                  border: '1.5px dashed #E9D5FF',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 900, color: '#111827' }}>
                  <Lock size={20} color="#111827" />
                  <span>Login to view coupons</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
                  Log in to see 100+ coupons &amp; unlocked bank cashback offers
                </p>
              </div>
            ) : appliedCoupon ? (
              /* Applied Coupon Banner */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ECFDF5', border: '1.5px solid #A7F3D0', padding: '14px 16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#065F46' }}>
                      Coupon "{appliedCoupon.code}" Applied!
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                      {appliedCoupon.discountType === 'free_delivery' ? 'Free Express Delivery unlocked' : `Saved extra ₹${couponDiscount} on this order`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { removeCoupon(); showToast('Coupon removed'); }}
                  style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#EF4444', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              /* Unlocked Coupons Available */
              <div
                onClick={() => setIsCouponModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ECFDF5', border: '1.5px solid #A7F3D0', padding: '14px 16px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tag size={20} color="#10B981" />
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#065F46', display: 'block' }}>3 Coupons Available</span>
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Save up to ₹100 extra with promo codes</span>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#10B981' }}>Apply &rarr;</span>
              </div>
            )}
          </div>

          {/* 2. DELIVERING IN MINUTES & ITEMS CARD */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #F3F4F6',
              padding: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            {/* Header: Delivering in minutes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                <Clock size={20} color="#374151" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#111827' }}>Delivering in minutes</div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</div>
              </div>
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item, idx) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    
                    {/* Left: Thumbnail & Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ProductSvg name={item.image} size={40} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '13.5px',
                            color: '#111827',
                            lineHeight: '1.3',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', fontWeight: 500 }}>
                          {item.weight || '1 unit'}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quantity Controls & Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: '#FFF1F2', // Pink highlight matching Image 2
                          border: '1px solid #FFE4E6',
                          borderRadius: '10px',
                          padding: '4px 10px',
                        }}
                      >
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{ border: 0, background: 'none', color: '#E11D48', fontWeight: 900, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span style={{ fontWeight: 900, fontSize: '13px', color: '#111827' }}>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          style={{ border: 0, background: 'none', color: '#E11D48', fontWeight: 900, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 900, fontSize: '14px', color: '#111827', minWidth: '48px', textAlign: 'right' }}>
                        ₹{item.price * item.qty}
                      </div>
                    </div>

                  </div>
                  {idx < items.length - 1 && <div style={{ height: '1px', backgroundColor: '#F3F4F6', margin: '14px 0 0' }} />}
                </div>
              ))}
            </div>

            {/* Forgot something? Add More Items Link */}
            <div style={{ borderTop: '1px solid #F3F4F6', marginTop: '16px', paddingTop: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#111827', fontWeight: 700 }}>
                Forgot something?{' '}
                <Link to="/" style={{ color: '#E11D48', fontWeight: 900, textDecoration: 'none' }}>
                  Add More Items
                </Link>
              </span>
            </div>

          </div>

          {/* 3. BILL SUMMARY CARD */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #F3F4F6',
              padding: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                <FileText size={18} color="#374151" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '16px', color: '#111827' }}>Bill Summary</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>
              <span>Item Total</span>
              <span style={{ fontWeight: 900, color: '#111827' }}>₹{itemTotal}</span>
            </div>

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10B981', fontWeight: 700 }}>
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 900 }}>-₹{couponDiscount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>
              <span>Delivery Charge</span>
              <span>{deliveryFee > 0 ? `₹${deliveryFee}` : <span style={{ color: '#10B981', fontWeight: 900 }}>FREE</span>}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#111827', fontWeight: 900, borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
              <span>Grand Total</span>
              <span style={{ color: '#0071E3' }}>₹{toPay}</span>
            </div>

            {/* Yellow Highlighted Alert Banner when NOT logged in */}
            {!isLoggedIn && (
              <div
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#92400E',
                  lineHeight: '1.45',
                  fontWeight: 600,
                }}
              >
                Log in to see your exact total. Applicable charges and discounts will be calculated based on your delivery details.
              </div>
            )}
          </div>

          {/* 4. MAIN BOTTOM CTA BUTTON */}
          <div style={{ marginTop: '8px' }}>
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={handleLoginToProceed}
                style={{
                  width: '100%',
                  backgroundColor: '#FF0060',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '18px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 0, 96, 0.3)',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                Login to Proceed
              </button>
            ) : (
              <Link
                to="/checkout"
                style={{
                  width: '100%',
                  backgroundColor: '#0071E3',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '18px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <span>Proceed to Checkout</span>
                <ChevronRight size={20} />
              </Link>
            )}
          </div>

        </div>
      )}

      {/* ── 🌟 INTERACTIVE COUPONS & OFFERS MODAL ── */}
      {isCouponModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => { setIsCouponModalOpen(false); setCouponFeedback(null); }}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} color="#0F172A" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Tag size={22} color="#0071E3" />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Coupons &amp; Offers
              </h3>
            </div>

            {/* Custom Promo Code Input Box */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="ENTER PROMO CODE (e.g. GRABIT50)"
                value={couponInputCode}
                onChange={(e) => setCouponInputCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: '12px',
                  border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 800,
                  textTransform: 'uppercase', outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleApplyCouponCode(couponInputCode)}
                style={{
                  background: '#0071E3', color: '#FFFFFF', border: 'none',
                  borderRadius: '12px', padding: '0 18px', fontSize: '13px',
                  fontWeight: 900, cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>

            {couponFeedback && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                marginBottom: '14px',
                background: couponFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: couponFeedback.type === 'success' ? '#065F46' : '#991B1B',
                border: `1px solid ${couponFeedback.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`
              }}>
                {couponFeedback.text}
              </div>
            )}

            {/* Available Coupons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Available Coupons for You
              </div>

              {(AVAILABLE_COUPONS || []).map((c) => {
                const isFreeDeliveryAlready = c.discountType === 'free_delivery' && itemTotal >= 100;
                const isEligible = itemTotal >= c.minOrder && !isFreeDeliveryAlready;
                const isCurrent = appliedCoupon?.code === c.code;

                return (
                  <div
                    key={c.code}
                    style={{
                      background: isCurrent ? '#EFF6FF' : '#F8FAFC',
                      border: isCurrent ? '2px solid #0071E3' : '1px solid #E2E8F0',
                      borderRadius: '16px', padding: '16px',
                      display: 'flex', flexDirection: 'column', gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{
                          background: '#DBEAFE', color: '#1E40AF', fontSize: '10px',
                          fontWeight: 900, padding: '3px 8px', borderRadius: '6px',
                          display: 'inline-block', marginBottom: '6px'
                        }}>
                          {c.badge}
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>
                          {c.description}
                        </div>
                      </div>

                      {isFreeDeliveryAlready ? (
                        <span style={{
                          fontSize: '11px', fontWeight: 800, color: '#059669',
                          background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '8px'
                        }}>
                          FREE DELIVERY
                        </span>
                      ) : isEligible ? (
                        <button
                          type="button"
                          onClick={() => handleApplyCouponCode(c.code)}
                          style={{
                            background: isCurrent ? '#10B981' : '#0071E3',
                            color: '#FFFFFF', border: 'none', borderRadius: '10px',
                            padding: '7px 16px', fontSize: '12px', fontWeight: 900,
                            cursor: 'pointer', flexShrink: 0
                          }}
                        >
                          {isCurrent ? 'APPLIED' : 'APPLY'}
                        </button>
                      ) : (
                        <span style={{
                          fontSize: '11px', fontWeight: 800, color: '#64748B',
                          background: '#E2E8F0', padding: '4px 10px', borderRadius: '8px'
                        }}>
                          LOCKED
                        </span>
                      )}
                    </div>

                    {isFreeDeliveryAlready ? (
                      <div style={{
                        fontSize: '11px', color: '#059669', background: '#ECFDF5',
                        border: '1px solid #A7F3D0', padding: '6px 10px', borderRadius: '8px',
                        fontWeight: 700
                      }}>
                        🎉 Orders above ₹100 already get FREE delivery! No coupon needed.
                      </div>
                    ) : !isEligible ? (
                      <div style={{
                        fontSize: '11px', color: '#D97706', background: '#FFFBEB',
                        border: '1px solid #FDE68A', padding: '6px 10px', borderRadius: '8px',
                        fontWeight: 700
                      }}>
                        Add ₹{c.minOrder - itemTotal} more to unlock this coupon
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ── 🌟 INTERACTIVE LOCATION & ADDRESS EDIT MODAL ── */}
      {isLocationModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '460px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => { setIsLocationModalOpen(false); setEditingAddrIndex(null); }}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#F1F5F9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} color="#0F172A" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <MapPin size={22} color="#0071E3" />
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {editingAddrIndex !== null ? 'Edit Delivery Address' : 'Select Delivery Location'}
              </h3>
            </div>

            {editingAddrIndex !== null ? (
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px' }}>LABEL (e.g. Home, Work, Gym)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px' }}>STREET ADDRESS / FLAT / BUILDING</label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px' }}>CITY &amp; PINCODE</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={e => setEditCity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingAddrIndex(null)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#0071E3', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      onClick={() => handleSelectAddress(addr.id)}
                      style={{
                        padding: '12px 14px', borderRadius: '14px',
                        border: addr.isDefault ? '2px solid #0071E3' : '1px solid #E2E8F0',
                        background: addr.isDefault ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>
                          🏠 {addr.title} {addr.isDefault && <span style={{ fontSize: '10px', color: '#0071E3', background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>DEFAULT</span>}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          {addr.address}, {addr.city}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleStartEdit(idx, e)}
                        style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  ))}
                </div>

                {/* Detect GPS / Add Custom Location */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '12px',
                      background: '#F0FDF4', border: '1px solid #86EFAC', color: '#16A34A',
                      fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      marginBottom: '12px'
                    }}
                  >
                    <Navigation size={16} /> {isLocating ? 'Detecting GPS...' : 'Use Current GPS Location'}
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Or enter new location (area, street)..."
                      value={customAddressInput}
                      onChange={(e) => setCustomAddressInput(e.target.value)}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomLocation}
                      style={{ background: '#0071E3', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '0 16px', fontWeight: 900, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
