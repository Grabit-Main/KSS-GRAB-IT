import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, Check, ChevronRight, Plus, CreditCard, Smartphone, Building2, Wallet, Banknote, Tag, FileText, ArrowLeft, Pencil, X, CheckCircle2, Navigation } from 'lucide-react';
import DeliveryLocationMapPicker from '../components/common/DeliveryLocationMapPicker';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { post } from '../api';
import ProductSvg from '../components/common/ProductSvg';
import useWindowWidth from '../hooks/useWindowWidth';
import {
  DEFAULT_CUSTOMER_ADDRESSES,
  loadCustomerAddresses,
  saveCustomerAddresses,
  getCustomerAddressKey
} from '../utils/addressManager';

const STEPS = ['Delivery', 'Payment', 'Review & Place Order'];

// Single constant for the one supermarket in the system
const STORE_ID = 'b5c9ff6b-1f64-405f-a25d-54dc6ea77bbb';

const PAYMENT_METHODS = [
  { id: 'upi', icon: <Smartphone size={18} color="#0071E3" />, label: 'UPI', sub: 'Pay using any UPI app', logos: ['GPay', 'Paytm'] },
  { id: 'card', icon: <CreditCard size={18} color="#0071E3" />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay & more', logos: ['VISA', 'MC', 'RuPay'] },
  { id: 'netbanking', icon: <Building2 size={18} color="#0071E3" />, label: 'Net Banking', sub: 'All major banks supported' },
  { id: 'wallet', icon: <Wallet size={18} color="#0071E3" />, label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik & more' },
  { id: 'cod', icon: <Banknote size={18} color="#0071E3" />, label: 'Cash on Delivery', sub: 'Pay in cash when your order arrives' },
];

import { forceScrollToTop } from '../utils/scrollToTop';

export default function CheckoutPage() {
  const { items, itemTotal, discount, deliveryFee, toPay, totalItems, clearCart, appliedCoupon, couponDiscount } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  // Instant scroll to top whenever step changes
  useEffect(() => {
    forceScrollToTop();
  }, [step]);

  // Enforce login for checkout: if user is not logged in, proceed to login page first
  useEffect(() => {
    const session = localStorage.getItem('grabit_session');
    const userStr = localStorage.getItem('grabit_user');
    if (!session || !userStr) {
      sessionStorage.setItem('grabit_intended_path', '/checkout');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const w = useWindowWidth();
  const isMobile = w <= 768;

  // ── LOCATION & ADDRESS STATE ──
  const getStoredUser = () => {
    try {
      const u = localStorage.getItem('grabit_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };
  const activeUser = getStoredUser();
  const isCustomerRole = activeUser?.role === 'customer' || !activeUser?.role;
  const currentName = isCustomerRole ? (activeUser?.full_name || activeUser?.name || 'Rahul Sharma') : 'Rahul Sharma';
  const currentPhone = (activeUser?.phone || '+919999900004').replace('+91', '').trim();
  const storeHubName = 'GrabIt Supermarket';

  const getAddressesKey = (phone) => getCustomerAddressKey(phone || activeUser?.phone);
  const loadUserAddresses = () => loadCustomerAddresses(activeUser?.phone);

  const [savedAddresses, setSavedAddresses] = useState(loadUserAddresses);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('list'); // 'list' | 'map'
  const [editingAddrIndex, setEditingAddrIndex] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', address: '', city: '' });
  const [customAddressInput, setCustomAddressInput] = useState('');

  // Sync addresses when updated from Header, Profile, or another tab
  useEffect(() => {
    const syncAddresses = () => {
      const list = loadCustomerAddresses(activeUser?.phone);
      setSavedAddresses(list);
    };
    window.addEventListener('grabit_addresses_updated', syncAddresses);
    window.addEventListener('storage', syncAddresses);
    return () => {
      window.removeEventListener('grabit_addresses_updated', syncAddresses);
      window.removeEventListener('storage', syncAddresses);
    };
  }, [activeUser?.phone]);

  const [selectedAddress, setSelectedAddress] = useState(() => {
    const list = loadUserAddresses();
    const def = list.find(a => a.isDefault) || list[0] || DEFAULT_CUSTOMER_ADDRESSES[0];
    const fullAddress = def.city && !def.address.includes(def.city)
      ? `${def.address}, ${def.city}`
      : def.address;
    return {
      title: def.title || def.tag || 'Home',
      name: currentName,
      phone: currentPhone,
      address: fullAddress,
      tag: 'DIRECT LOCATION',
      time: def.time || '15-25 min delivery'
    };
  });

  const saveAddressesToStorage = (list) => {
    setSavedAddresses(list);
    saveCustomerAddresses(list, activeUser?.phone);
  };

  const handleSelectAddress = (addr) => {
    const fullAddressText = addr.city && !addr.address.includes(addr.city)
      ? `${addr.address}, ${addr.city}`
      : addr.address;
    const formatted = {
      title: addr.title || addr.tag || 'Delivery Location',
      name: currentName,
      phone: currentPhone,
      address: fullAddressText,
      tag: 'SELECTED LOCATION',
      time: addr.time || '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to "${fullAddressText}"!`);
  };

  const handleStartEdit = (e, addr, idx) => {
    e.stopPropagation();
    setEditingAddrIndex(idx);
    setEditForm({ title: addr.title || addr.tag || 'Home', address: addr.address || '', city: addr.city || '' });
  };

  const handleSaveEditedAddress = (e) => {
    e.preventDefault();
    if (!editForm.address.trim()) return;
    const updated = [...savedAddresses];
    const cityStr = editForm.city.trim();
    const fullAddrStr = cityStr && !editForm.address.includes(cityStr)
      ? `${editForm.address.trim()}, ${cityStr}`
      : editForm.address.trim();

    updated[editingAddrIndex] = {
      ...updated[editingAddrIndex],
      title: editForm.title.trim() || 'Home',
      tag: editForm.title.trim() || 'Home',
      address: editForm.address.trim(),
      city: cityStr || 'Bengaluru',
      area: editForm.address.split(',')[0] || 'Koramangala'
    };
    saveAddressesToStorage(updated);

    const formatted = {
      title: editForm.title.trim() || 'Home',
      name: currentName,
      phone: currentPhone,
      address: fullAddrStr,
      tag: 'EDITED LOCATION',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setEditingAddrIndex(null);
    setIsLocationModalOpen(false);
    showToast(`Address updated to "${fullAddrStr}"!`);
  };

  const handleAddCustomAddress = (e) => {
    e.preventDefault();
    if (!customAddressInput.trim()) return;
    const customText = customAddressInput.trim();
    const newAddrObj = {
      id: Date.now(),
      title: 'Custom Location',
      address: customText,
      city: '',
      isDefault: false
    };
    const updated = [...savedAddresses, newAddrObj];
    saveAddressesToStorage(updated);

    const formatted = {
      title: 'Custom Location',
      name: currentName,
      phone: currentPhone,
      address: customText,
      tag: 'DIRECT LOCATION',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setCustomAddressInput('');
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to "${customText}"!`);
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    const rawId = `ord-${Date.now()}`;
    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.qty || 1,
      quantity: item.qty || 1,
      price: item.price,
      image: item.image,
    }));

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GB-${randomNum}`;

    const baseOrder = {
      id: orderNumber,
      orderNumber: orderNumber,
      rawId: rawId,
      customer_name: selectedAddress.name || currentName || 'Customer',
      customer_phone: selectedAddress.phone || currentPhone || '',
      delivery_address: selectedAddress.address,
      address: selectedAddress.address,
      items: orderItems,
      total_amount: toPay,
      subtotal: itemTotal,
      delivery_fee: deliveryFee,
      discount: discount || 0,
      status: 'placed',
      payment_method: (selectedPayment || 'upi').toUpperCase(),
      estimated_time: selectedAddress.time || '15-25 min delivery',
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const apiRes = await post('/orders/', {
        store_id: STORE_ID,
        delivery_address: selectedAddress.address,
        items: orderItems,
        total_amount: toPay,
        customer_name: baseOrder.customer_name,
        customer_phone: baseOrder.customer_phone,
        payment_method: baseOrder.payment_method,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'placed'
      });

      if (!apiRes || !apiRes.id) {
        throw new Error('Order was not confirmed by the server. Please try again.');
      }

      // Build confirmed order using server-recomputed total_amount (B5c)
      const confirmedTotal = (apiRes.total_amount != null) ? apiRes.total_amount : toPay;
      const finalOrder = {
        ...baseOrder,
        id: apiRes.id,
        rawId: apiRes.id,
        orderNumber: apiRes.id,
        total_amount: confirmedTotal,
      };

      // Persist to localStorage ONLY on confirmed success
      try {
        const digits = (finalOrder.customer_phone || currentPhone || '').replace(/\D/g, '');
        const custPhone = digits.length >= 10 ? digits.slice(-10) : digits;
        const storageKey = custPhone ? `grabit_orders_${custPhone}` : 'grabit_orders_guest';

        const existingUserOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const filteredUser = existingUserOrders.filter(o => o.rawId !== rawId && o.id !== orderNumber && o.id !== finalOrder.id);
        localStorage.setItem(storageKey, JSON.stringify([finalOrder, ...filteredUser]));

        const globalExisting = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        const filteredGlobal = globalExisting.filter(o => o.rawId !== rawId && o.id !== orderNumber && o.id !== finalOrder.id);
        localStorage.setItem('grabit_orders', JSON.stringify([finalOrder, ...filteredGlobal]));

        window.dispatchEvent(new Event('grabit_orders_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.warn('Storage sync:', e);
      }

      // Clear cart and show success only after confirmed order
      clearCart();
      setOrderPlaced(true);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      // Show error toast and stay on review step — button re-enables via finally
      const msg = err?.message || 'Order failed. Please check your connection and try again.';
      showToast(msg, 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #0A1628 70%, #060D1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'orbFloat1 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'orbFloat2 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(0,113,227,0.06) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'orbPulse 4s ease-in-out infinite'
        }} />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${3 + (i % 4)}px`,
            height: `${3 + (i % 4)}px`,
            borderRadius: '50%',
            background: i % 3 === 0 ? '#0071E3' : i % 3 === 1 ? '#10B981' : '#F59E0B',
            opacity: 0.4 + (i % 3) * 0.15,
            left: `${5 + (i * 4.7) % 92}%`,
            top: `${8 + (i * 7.3) % 85}%`,
            animation: `particleDrift ${4 + (i % 4)}s ease-in-out ${i * 0.3}s infinite alternate`
          }} />
        ))}

        {/* Grid lines overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(0,113,227,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,113,227,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }} />

        {/* CSS Animations */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
          @keyframes orbFloat1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -20px) scale(1.1); }
          }
          @keyframes orbFloat2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, 30px) scale(1.08); }
          }
          @keyframes orbPulse {
            0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%,-50%) scale(1.08); }
          }
          @keyframes particleDrift {
            from { transform: translateY(0px) rotate(0deg); }
            to { transform: translateY(-18px) rotate(180deg); }
          }
          @keyframes successEntry {
            0% { opacity: 0; transform: translateY(40px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes iconBounce {
            0% { opacity: 0; transform: scale(0) rotate(-15deg); }
            60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
            80% { transform: scale(0.92) rotate(-2deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 40px rgba(0,113,227,0.3), 0 0 80px rgba(0,113,227,0.1); }
            50% { box-shadow: 0 0 60px rgba(0,113,227,0.5), 0 0 120px rgba(0,113,227,0.2); }
          }
          @keyframes checkmarkDraw {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes fadeSlideUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes progressFill {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes ringExpand {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          .success-stat-card:hover { transform: translateY(-2px); }
        `}</style>

        {/* Main card */}
        <div style={{
          position: 'relative', zIndex: 10,
          animation: 'successEntry 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards',
          maxWidth: '480px', width: '90%', margin: '0 auto'
        }}>
          {/* Glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '28px',
            padding: '48px 40px 40px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>

            {/* Animated success icon */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px', animation: 'iconBounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
              {/* Pulsing rings */}
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)', animation: 'ringExpand 2s ease-out 0.8s infinite' }} />
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.3)', animation: 'ringExpand 2s ease-out 1.2s infinite' }} />

              {/* Icon circle */}
              <div style={{
                width: '90px', height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'glowPulse 2.5s ease-in-out 1s infinite',
                boxShadow: '0 0 40px rgba(16,185,129,0.4)',
                position: 'relative'
              }}>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path
                    d="M10 22L18 30L34 14"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    style={{ animation: 'checkmarkDraw 0.5s ease-out 0.6s both' }}
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div style={{ animation: 'fadeSlideUp 0.5s ease-out 0.5s both' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: '#10B981',
                marginBottom: '10px'
              }}>
                ✦ ORDER CONFIRMED ✦
              </div>
              <h1 style={{
                fontSize: '30px', fontWeight: 900, lineHeight: 1.15,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #93C5FD 50%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', margin: '0 0 10px',
                letterSpacing: '-0.5px'
              }}>
                Order Placed<br />Successfully!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 500, margin: '0 0 28px' }}>
                Your items are being prepared by the store
              </p>
            </div>

            {/* ETA Highlight */}
            <div style={{
              animation: 'fadeSlideUp 0.5s ease-out 0.7s both',
              background: 'linear-gradient(135deg, rgba(0,113,227,0.2) 0%, rgba(16,185,129,0.1) 100%)',
              border: '1px solid rgba(0,113,227,0.3)',
              borderRadius: '16px', padding: '18px 20px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, #0071E3, #005BB5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', boxShadow: '0 4px 14px rgba(0,113,227,0.4)'
              }}>⚡</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Estimated Delivery</div>
                <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px' }}>{selectedAddress.time}</div>
                <div style={{ color: '#10B981', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>Express delivery • {selectedAddress.title}</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              animation: 'fadeSlideUp 0.5s ease-out 0.9s both',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px', marginBottom: '28px'
            }}>
              {[
                { emoji: '🛍️', label: 'Items', value: `${totalItems}` },
                { emoji: '💳', label: 'Payment', value: (selectedPayment || 'UPI').toUpperCase().slice(0, 4) },
                { emoji: '💰', label: 'Saved', value: `₹${discount + (appliedCoupon ? Math.round(itemTotal * (appliedCoupon.discount / 100)) : 0)}` },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="success-stat-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '14px 10px',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{emoji}</div>
                  <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 900 }}>{value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Redirect progress bar */}
            <div style={{ animation: 'fadeSlideUp 0.5s ease-out 1.1s both' }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', display: 'inline-block', animation: 'orbPulse 1s ease-in-out infinite' }} />
                Redirecting to My Orders...
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '100px', height: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0071E3, #10B981)',
                  borderRadius: '100px',
                  animation: 'progressFill 2s linear 0.5s both',
                  backgroundSize: '200% auto',
                }} />
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div style={{
            textAlign: 'center', marginTop: '18px',
            animation: 'fadeSlideUp 0.5s ease-out 1.3s both'
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 600
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              100% Secure & Encrypted
            </span>
          </div>
        </div>
      </div>
    );
  }


  const OrderSummaryCard = () => (
    <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: isMobile ? 'static' : 'sticky', top: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontWeight: 900, fontSize: '16px', color: '#0F172A' }}>Order Summary</span>
        <span style={{ color: '#0071E3', fontSize: '13px', fontWeight: 800 }}>{totalItems} Items</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{ width: '40px', height: '40px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }} /> : <ProductSvg name={item.image || item.name} size={30} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{item.weight || '1 unit'} • Qty: {item.qty}</div>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', flexShrink: 0, whiteSpace: 'nowrap' }}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin: '12px 0', borderColor: '#E2E8F0' }} />
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}><span>Item Total ({totalItems} items)</span><span style={{ fontWeight: 800, color: '#0F172A' }}>₹{itemTotal}</span></div>
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}><span>Discount</span><span style={{ color: '#10B981', fontWeight: 900 }}>-₹{discount}</span></div>
      {appliedCoupon && (
        <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}>
          <span>Coupon Discount ({appliedCoupon.code})</span>
          <span style={{ color: '#10B981', fontWeight: 900 }}>-₹{couponDiscount}</span>
        </div>
      )}
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}>
        <span>Delivery Fee</span>
        <span>{deliveryFee > 0 ? <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{deliveryFee}</span> : <><span style={{ textDecoration: 'line-through', color: '#94A3B8', marginRight: '4px' }}>₹30</span> <span style={{ color: '#10B981', fontWeight: 900 }}>FREE</span></>}</span>
      </div>
      <div className="bill-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, paddingTop: '8px', color: '#0F172A' }}><span>To Pay</span><span style={{ color: '#0071E3' }}>₹{toPay}</span></div>
      
      <div className="savings-banner" style={{ marginTop: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Tag size={14} color="#10B981" />
        You're saving ₹{discount + couponDiscount} on this order
      </div>
      
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px', marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Zap size={16} color="#0071E3" fill="#0071E3" />
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 900, color: '#0F172A' }}>Delivery in {selectedAddress.time}</div>
          <div style={{ color: '#0071E3', fontSize: '11px', fontWeight: 700 }}>Express delivery to {selectedAddress.title} • {selectedAddress.tag}</div>
        </div>
      </div>

      {step === 2 && (
        <button
          className="btn btn-primary btn-lg"
          style={{
            width: '100%', marginTop: '16px', justifyContent: 'center',
            background: isPlacingOrder ? '#93C5FD' : '#0071E3',
            borderRadius: '12px', fontWeight: 900, minHeight: '46px',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
            opacity: isPlacingOrder ? 0.8 : 1,
            transition: 'background 0.2s, opacity 0.2s'
          }}
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? '⏳ Placing Order…' : `🔒 Place Order ₹${toPay}`}
        </button>
      )}
      {step === 1 && (
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', background: '#0071E3', borderRadius: '12px', fontWeight: 900, minHeight: '46px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setStep(2)}>
          Continue to Review <ChevronRight size={16} />
        </button>
      )}
      {step === 0 && (
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', background: '#0071E3', borderRadius: '12px', fontWeight: 900, minHeight: '46px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setStep(1)}>
          Continue to Payment <ChevronRight size={16} />
        </button>
      )}
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '8px', fontWeight: 600 }}>🔒 100% Secure Payments</div>
    </div>
  );

  return (
    <div className="container section" style={{ paddingTop: isMobile ? '12px' : '24px', minHeight: '100vh' }}>

      {/* Header Bar with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/cart')}
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={18} color="#0F172A" />
        </button>
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, margin: 0, color: '#0F172A' }}>{STEPS[step]}</h1>
      </div>

      {/* Stepper Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: '#FFFFFF', padding: '12px 16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i <= step ? '#0071E3' : '#E2E8F0', color: i <= step ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                {i < step ? <Check size={14} color="#FFF" /> : i + 1}
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: i === step ? 900 : 700, color: i === step ? '#0F172A' : '#64748B', display: isMobile ? 'none' : 'inline' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: '2px', margin: '0 8px', background: i < step ? '#0071E3' : '#E2E8F0' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '24px', alignItems: 'flex-start' }}>
        <div>
          {/* ── STEP 1: DELIVERY ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>
                  <MapPin size={20} color="#0071E3" /> 1. Select Delivery Address
                </h3>
                
                {/* Active Delivery Address Box */}
                <div style={{ border: '2px solid #0071E3', borderRadius: '16px', padding: isMobile ? '14px' : '16px', background: '#EFF6FF', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap' }}>🏠 {selectedAddress.title} (Selected)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      style={{
                        color: '#0071E3', fontSize: '12px', fontWeight: 800,
                        background: '#FFFFFF', border: '1px solid #BFDBFE',
                        borderRadius: '8px', padding: '5px 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                    <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '13.5px' }}>{selectedAddress.address}</span><br />
                    <strong style={{ color: '#0F172A' }}>{currentName}</strong> • {currentPhone}<br />
                    <span style={{ fontSize: '11.5px', color: '#0071E3', fontWeight: 800, marginTop: '4px', display: 'inline-block' }}>
                      Fulfilling Store: 🏪 {storeHubName} (Koramangala Central Hub)
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px dashed #0071E3', borderRadius: '12px', color: '#0071E3', fontWeight: 800, fontSize: '13.5px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Choose / Add New Address
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>2. Select Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PAYMENT_METHODS.map(pm => {
                    const isSel = selectedPayment === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedPayment(pm.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px', borderRadius: '14px',
                          border: isSel ? '2px solid #0071E3' : '1px solid #E2E8F0',
                          background: isSel ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {pm.icon}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{pm.label}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{pm.sub}</div>
                          </div>
                        </div>
                        {isSel && <CheckCircle2 size={20} color="#0071E3" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === 2 && (
            <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>3. Review Order Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ maxWidth: '34px', maxHeight: '34px', objectFit: 'contain' }} /> : <ProductSvg name={item.name} category={item.category} size={30} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35 }}>{item.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>Qty: {item.qty} × ₹{item.price}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right' }}>₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Delivery Address</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{selectedAddress.address}</div>
                <div style={{ fontSize: '12px', color: '#0071E3', fontWeight: 700, marginTop: '2px' }}>Fulfilling Store: {storeHubName}</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Payment Method</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>{selectedPayment}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Summary */}
        <div style={{ position: isMobile ? 'static' : 'sticky', top: '90px' }}>
          <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items ({totalItems})</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{itemTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>-₹{discount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>FREE</span>
              </div>
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                <span>Total Amount</span>
                <span style={{ color: '#0071E3' }}>₹{toPay}</span>
              </div>
            </div>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '14px', color: '#FFFFFF', fontWeight: 900, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,113,227,0.25)' }}
              >
                Proceed to {STEPS[step + 1]} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                style={{ width: '100%', background: '#10B981', border: 'none', borderRadius: '12px', padding: '14px', color: '#FFFFFF', fontWeight: 900, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
              >
                Place Express Order (₹{toPay})
              </button>
            )}
          </div>
        </div>
      </div>

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
                {editingAddrIndex !== null ? 'Edit Delivery Address' : (modalTab === 'map' ? 'Pick Location on Map' : 'Select Delivery Location')}
              </h3>
            </div>

            {editingAddrIndex !== null ? (
              /* INLINE ADDRESS EDIT FORM */
              <form onSubmit={handleSaveEditedAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Address Tag (e.g. Home, Work, Apartment)</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Street Address / Flat / Building</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    required
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>Area / City / Pincode</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="e.g. Koramangala, Bengaluru 560034"
                    style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingAddrIndex(null)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#0071E3', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,113,227,0.25)' }}
                  >
                    Save &amp; Select Address
                  </button>
                </div>
              </form>
            ) : modalTab === 'map' ? (
              <DeliveryLocationMapPicker
                initialLat={13.014333}
                initialLng={77.646000}
                initialTitle="Kalpanaaa Software Solutions — Main Office"
                onSelectLocation={(newLoc) => {
                  const updated = [newLoc, ...savedAddresses.filter(a => a.tag !== 'Pinned Location')];
                  saveAddressesToStorage(updated);
                  handleSelectAddress(newLoc);
                  setIsLocationModalOpen(false);
                  setModalTab('list');
                  showToast('Delivery location selected from map!');
                }}
                onClose={() => setModalTab('list')}
              />
            ) : (
              /* SAVED ADDRESS LIST & ADD CUSTOM LOCATION */
              <>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>
                  Select or edit a delivery address. All orders are dispatched from <strong>GrabIt Supermarket</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px', maxHeight: '240px', overflowY: 'auto' }}>
                  {savedAddresses.map((addr, idx) => {
                    const fullAddrStr = addr.address + (addr.city ? `, ${addr.city}` : '');
                    const isSelected = selectedAddress.address === fullAddrStr || selectedAddress.title === addr.title;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectAddress(addr)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#F8FAFC',
                          border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                          borderRadius: '14px', padding: '12px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{addr.title}</span>
                            {addr.isDefault && (
                              <span style={{ fontSize: '9px', background: '#0071E3', color: '#FFF', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>{fullAddrStr}</div>
                          <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, marginTop: '2px' }}>15-25 min delivery</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(e, addr, idx)}
                            style={{
                              background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
                              padding: '4px 10px', fontSize: '11px', fontWeight: 800, color: '#0071E3',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          {isSelected && <CheckCircle2 size={20} color="#0071E3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Location Form */}
                <form onSubmit={handleAddCustomAddress}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                      Enter New Delivery Address / Pincode
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={customAddressInput}
                        onChange={e => setCustomAddressInput(e.target.value)}
                        placeholder="e.g. Koramangala 5th Block, Bengaluru 560095"
                        style={{
                          width: '100%', height: '42px', borderRadius: '12px',
                          border: '1px solid #CBD5E1', paddingLeft: '38px', paddingRight: '12px',
                          fontSize: '13px', fontWeight: 700, outline: 'none'
                        }}
                      />
                      <Navigation size={16} color="#0071E3" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', background: '#0071E3', border: 'none',
                      borderRadius: '12px', padding: '12px', fontSize: '13.5px',
                      fontWeight: 900, color: '#FFFFFF', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,113,227,0.25)'
                    }}
                  >
                    Save &amp; Select New Location
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
