import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, Check, ChevronRight, Plus, CreditCard, Smartphone, Building2, Wallet, Banknote, Tag, FileText, ArrowLeft, Pencil, X, CheckCircle2, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductSvg from '../components/common/ProductSvg';
import useWindowWidth from '../hooks/useWindowWidth';
import { post } from '../../api';

const STEPS = ['Delivery', 'Payment', 'Review & Place Order'];

const PAYMENT_METHODS = [
  { id: 'upi', icon: <Smartphone size={18} color="#0071E3" />, label: 'UPI', sub: 'Pay using any UPI app', logos: ['GPay', 'Paytm'] },
  { id: 'card', icon: <CreditCard size={18} color="#0071E3" />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay & more', logos: ['VISA', 'MC', 'RuPay'] },
  { id: 'netbanking', icon: <Building2 size={18} color="#0071E3" />, label: 'Net Banking', sub: 'All major banks supported' },
  { id: 'wallet', icon: <Wallet size={18} color="#0071E3" />, label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik & more' },
  { id: 'cod', icon: <Banknote size={18} color="#0071E3" />, label: 'Cash on Delivery', sub: 'Pay in cash when your order arrives' },
];

import { useEffect } from 'react';
import { forceScrollToTop } from '../../utils/scrollToTop';

export default function CheckoutPage() {
  const { items, itemTotal, discount, deliveryFee, toPay, totalItems, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

  // Instant scroll to top whenever step changes
  useEffect(() => {
    forceScrollToTop();
  }, [step]);

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
  const currentName = activeUser?.full_name || activeUser?.name || 'Customer';
  const currentPhone = (activeUser?.phone || '').replace('+91', '').trim();

  const getAddressesKey = (phone) => `grabit_addresses_${(phone || 'default').replace(/\D/g, '')}`;
  const loadUserAddresses = () => {
    try {
      const data = localStorage.getItem(getAddressesKey(activeUser?.phone));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const [savedAddresses, setSavedAddresses] = useState(loadUserAddresses);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const list = loadUserAddresses();
    if (list.length > 0) {
      const def = list.find(a => a.isDefault) || list[0];
      return {
        title: def.title || 'Home',
        name: currentName,
        phone: currentPhone,
        address: def.address + (def.city ? `, ${def.city}` : ''),
        tag: 'SAVED LOCATION',
        time: '15-25 min delivery'
      };
    }
    return {
      title: 'Delivery Location',
      name: currentName || 'Valued Customer',
      phone: currentPhone || '9876543210',
      address: 'Flat 301, Sunshine Heights, 80 Feet Rd, Koramangala, Bengaluru 560034',
      tag: 'DIRECT DELIVERY',
      time: '15-25 min delivery'
    };
  });

  const [customAddressInput, setCustomAddressInput] = useState('');

  const handleSelectAddress = (addr) => {
    const formatted = {
      title: addr.title,
      name: currentName,
      phone: currentPhone,
      address: addr.address + (addr.city ? `, ${addr.city}` : ''),
      tag: 'SAVED LOCATION',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to ${addr.title}!`);
  };

  const handleAddCustomAddress = (e) => {
    e.preventDefault();
    if (!customAddressInput.trim()) return;
    const newAddr = {
      title: 'Delivery Address',
      name: currentName,
      phone: currentPhone,
      address: customAddressInput.trim(),
      tag: 'DIRECT LOCATION',
      time: '15-25 min delivery',
      isDefault: savedAddresses.length === 0
    };
    const updated = [...savedAddresses, { title: newAddr.title, address: newAddr.address, city: '', isDefault: newAddr.isDefault }];
    setSavedAddresses(updated);
    try {
      localStorage.setItem(getAddressesKey(activeUser?.phone), JSON.stringify(updated));
    } catch {}
    setSelectedAddress(newAddr);
    setCustomAddressInput('');
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${newAddr.address}"!`);
  };

  const handlePlaceOrder = async () => {
    const newOrderId = 'GB-' + Math.floor(1000 + Math.random() * 9000);
    const rawId = 'ord-' + Date.now();
    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name,
      qty: i.qty || 1,
      quantity: i.qty || 1,
      price: i.price,
      image: i.image,
    }));

    const newOrderObj = {
      id: newOrderId,
      orderNumber: newOrderId,
      rawId: rawId,
      customer_name: selectedAddress.name || currentName || 'Customer',
      customer_phone: selectedAddress.phone || currentPhone || '',
      total_amount: toPay,
      subtotal: itemTotal,
      delivery_fee: deliveryFee,
      discount: discount || 0,
      status: 'placed',
      item_count: totalItems,
      items: orderItems,
      delivery_address: selectedAddress.address,
      address: selectedAddress.address,
      payment_method: (selectedPayment || 'upi').toUpperCase(),
      estimated_time: selectedAddress.time || '15-25 min delivery',
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      localStorage.setItem('grabit_orders', JSON.stringify([newOrderObj, ...existing]));
      window.dispatchEvent(new Event('grabit_orders_updated'));
    } catch {}

    try {
      await post('/orders/', {
        store_id: 'b5c9ff6b-1f64-405f-a25d-54dc6ea77bbb',
        total_amount: toPay,
        delivery_address: selectedAddress.address,
        items: orderItems,
        customer_name: newOrderObj.customer_name,
        customer_phone: newOrderObj.customer_phone,
        payment_method: newOrderObj.payment_method,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'placed',
      });
    } catch (e) {
      console.warn('Live order save fallback:', e);
    }
    setOrderPlaced(true);
    clearCart();
    setTimeout(() => navigate('/orders'), 2000);
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

        {/* CSS Animations */}
        <style>{`
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
          @keyframes ringExpand {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
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
              <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)', animation: 'ringExpand 2s ease-out 0.8s infinite' }} />
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
                { emoji: '💰', label: 'Saved', value: `₹${discount}` },
              ].map(({ emoji, label, value }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '14px 10px'
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
                  animation: 'progressFill 2s linear 0.5s both'
                }} />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px', animation: 'fadeSlideUp 0.5s ease-out 1.3s both' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 600 }}>🔒 100% Secure & Encrypted</span>
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
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: '#F8FAFC', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0', flexShrink: 0 }}>
              <ProductSvg name={item.image} size={34} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{item.weight} • Qty: {item.qty}</div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin: '12px 0', borderColor: '#E2E8F0' }} />
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}><span>Item Total ({totalItems} items)</span><span style={{ fontWeight: 800, color: '#0F172A' }}>₹{itemTotal}</span></div>
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}><span>Discount</span><span style={{ color: '#10B981', fontWeight: 900 }}>-₹{discount}</span></div>
      <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#64748B' }}>
        <span>Delivery Fee</span>
        <span>{deliveryFee > 0 ? <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{deliveryFee}</span> : <><span style={{ textDecoration: 'line-through', color: '#94A3B8', marginRight: '4px' }}>₹30</span> <span style={{ color: '#10B981', fontWeight: 900 }}>FREE</span></>}</span>
      </div>
      <div className="bill-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, paddingTop: '8px', color: '#0F172A' }}><span>To Pay</span><span style={{ color: '#0071E3' }}>₹{toPay}</span></div>
      
      <div className="savings-banner" style={{ marginTop: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Tag size={14} color="#10B981" />
        You're saving ₹{discount} on this order
      </div>
      
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px', marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Zap size={16} color="#0071E3" fill="#0071E3" />
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 900, color: '#0F172A' }}>Delivery in {selectedAddress.time}</div>
          <div style={{ color: '#0071E3', fontSize: '11px', fontWeight: 700 }}>Express delivery to {selectedAddress.title} • {selectedAddress.tag}</div>
        </div>
      </div>

      {step === 2 && (
        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', justifyContent: 'center', background: '#0071E3', borderRadius: '12px', fontWeight: 900, minHeight: '46px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handlePlaceOrder}>
          🔒 Place Order ₹{toPay}
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
                
                {/* Active Delivery Address Box (INTERACTIVE & MOBILE RESPONSIVE) */}
                <div style={{ border: '2px solid #0071E3', borderRadius: '16px', padding: isMobile ? '14px' : '16px', background: '#EFF6FF', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap' }}>🏠 {selectedAddress.title} (Selected)</span>
                      <span style={{ fontSize: '10px', background: '#0071E3', color: '#FFFFFF', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{selectedAddress.tag}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      style={{
                        color: '#0071E3', fontSize: '12px', fontWeight: 800,
                        background: '#FFFFFF', border: '1px solid #BFDBFE',
                        borderRadius: '8px', padding: '5px 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,113,227,0.1)'
                      }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                    {selectedAddress.address}<br />
                    <strong style={{ color: '#0F172A' }}>{selectedAddress.name}</strong> • {selectedAddress.phone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px dashed #0071E3', borderRadius: '12px', color: '#0071E3', fontWeight: 800, fontSize: '13.5px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Choose / Add New Address
                </button>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px 14px', marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12.5px', color: '#065F46', fontWeight: 700 }}>
                  <Check size={16} color="#10B981" style={{ flexShrink: 0 }} /> Express delivery in {selectedAddress.time} within 5 km radius.
                </div>
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
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>DELIVERING TO</div>
                <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{selectedAddress.title} • {selectedAddress.address}</div>
                <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, marginTop: '2px' }}>{selectedAddress.time}</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>PAYMENT METHOD</div>
                <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', marginTop: '2px', textTransform: 'uppercase' }}>{selectedPayment}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR SUMMARY ── */}
        <OrderSummaryCard />
      </div>

      {/* ── 🌟 LOCATION MODAL IN CHECKOUT ── */}
      {isLocationModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button
              onClick={() => setIsLocationModalOpen(false)}
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
                Select Delivery Location
              </h3>
            </div>

            {/* Saved Addresses List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {savedAddresses.map((addr, idx) => {
                const isSelected = selectedAddress.title === addr.title;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectAddress(addr)}
                    style={{
                      background: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                      borderRadius: '14px', padding: '12px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{addr.title}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>{addr.address}</div>
                      <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, marginTop: '2px' }}>{addr.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectAddress(addr); showToast(`Editing address for "${addr.title}"...`); }}
                        style={{
                          background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
                          padding: '3px 8px', fontSize: '11px', fontWeight: 800, color: '#0071E3',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      {isSelected && <CheckCircle2 size={20} color="#0071E3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Address */}
            <form onSubmit={handleAddCustomAddress}>
              <input
                type="text"
                value={customAddressInput}
                onChange={e => setCustomAddressInput(e.target.value)}
                placeholder="e.g. Koramangala 5th Block, Bengaluru 560095"
                style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '13px', fontWeight: 700, outline: 'none', marginBottom: '14px' }}
              />
              <button type="submit" style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13.5px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>
                Save &amp; Select New Location
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
