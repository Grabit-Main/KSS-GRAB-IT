import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, Check, ChevronRight, Plus, CreditCard, Smartphone, Building2, Wallet, Banknote, Tag, FileText, ArrowLeft, Pencil, X, CheckCircle2, Navigation, ShoppingBag } from 'lucide-react';
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
import { addUserNotification } from '../../utils/userNotifications';

export default function CheckoutPage() {
  const { items, itemTotal, discount, deliveryFee, toPay, totalItems, clearCart, appliedCoupon, couponDiscount } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Instant scroll to top whenever step changes
  useEffect(() => {
    forceScrollToTop();
  }, [step]);

  // Enforce login for checkout: if user is not logged in, proceed to login page first
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('grabit_token');
    if (!token) {
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
  const [showCouponBackWarningModal, setShowCouponBackWarningModal] = useState(false);

  // Sync addresses when updated from Header, Profile, Cart, or another tab
  useEffect(() => {
    const syncAddresses = () => {
      const list = loadUserAddresses();
      setSavedAddresses(list);

      // 1. Check if an address was explicitly selected/edited in Cart
      try {
        const stored = localStorage.getItem('grabit_selected_address');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.address) {
            setSelectedAddress({
              title: parsed.title || parsed.tag || 'Delivery Address',
              name: parsed.name || currentName,
              phone: parsed.phone || currentPhone,
              address: parsed.city && !parsed.address.includes(parsed.city)
                ? `${parsed.address}, ${parsed.city}`
                : parsed.address,
              tag: parsed.tag || 'SELECTED LOCATION',
              time: parsed.time || '15-25 min delivery'
            });
            return;
          }
        }
      } catch {}

      // 2. Fall back to default from customer address list
      const def = list.find(a => a.isDefault) || list[0];
      if (def) {
        const fullAddress = def.city && !def.address.includes(def.city)
          ? `${def.address}, ${def.city}`
          : def.address;
        setSelectedAddress({
          title: def.title || def.tag || 'Home',
          name: currentName,
          phone: currentPhone,
          address: fullAddress,
          tag: 'SAVED LOCATION',
          time: def.time || '15-25 min delivery'
        });
      }
    };
    window.addEventListener('grabit_addresses_updated', syncAddresses);
    window.addEventListener('grabit_selected_address_updated', syncAddresses);
    window.addEventListener('storage', syncAddresses);
    return () => {
      window.removeEventListener('grabit_addresses_updated', syncAddresses);
      window.removeEventListener('grabit_selected_address_updated', syncAddresses);
      window.removeEventListener('storage', syncAddresses);
    };
  }, [activeUser?.phone, currentName, currentPhone]);

  const [selectedAddress, setSelectedAddress] = useState(() => {
    // 1. Explicitly selected address from Cart
    try {
      const stored = localStorage.getItem('grabit_selected_address');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.address) {
          return {
            title: parsed.title || parsed.tag || 'Delivery Address',
            name: parsed.name || currentName,
            phone: parsed.phone || currentPhone,
            address: parsed.city && !parsed.address.includes(parsed.city)
              ? `${parsed.address}, ${parsed.city}`
              : parsed.address,
            tag: parsed.tag || 'SELECTED LOCATION',
            time: parsed.time || '15-25 min delivery'
          };
        }
      }
    } catch {}

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
    try {
      const saved = localStorage.getItem('grabit_delivery_location');
      if (saved) {
        if (saved && !saved.toLowerCase().includes('sunshine heights')) {
          return {
            title: 'Delivery Location',
            name: currentName,
            phone: currentPhone,
            address: saved,
            tag: 'GPS / PINNED LOCATION',
            time: '15-25 min delivery'
          };
        }
      }
    } catch {}
    return null;
  });

  // Permanently sync selected address so it is never lost on navigation
  useEffect(() => {
    if (selectedAddress && selectedAddress.address) {
      try {
        localStorage.setItem('grabit_selected_address', JSON.stringify(selectedAddress));
        localStorage.setItem('grabit_delivery_location', selectedAddress.address);
      } catch {}
    }
  }, [selectedAddress]);

  const handleStepBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      // Step 0: Going back to /cart
      if (appliedCoupon) {
        setShowCouponBackWarningModal(true);
      } else {
        if (selectedAddress && selectedAddress.address) {
          try {
            localStorage.setItem('grabit_selected_address', JSON.stringify(selectedAddress));
            localStorage.setItem('grabit_delivery_location', selectedAddress.address);
          } catch {}
        }
        navigate('/cart');
      }
    }
  };

  const handleConfirmBackToCart = () => {
    setShowCouponBackWarningModal(false);
    if (selectedAddress && selectedAddress.address) {
      try {
        localStorage.setItem('grabit_selected_address', JSON.stringify(selectedAddress));
        localStorage.setItem('grabit_delivery_location', selectedAddress.address);
      } catch {}
    }
    navigate('/cart');
  };

  const [customAddressInput, setCustomAddressInput] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

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
    try {
      localStorage.setItem('grabit_selected_address', JSON.stringify(formatted));
      localStorage.setItem('grabit_delivery_location', formatted.address);
      window.dispatchEvent(new CustomEvent('grabit_selected_address_updated', { detail: formatted }));
    } catch {}
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
    setShowManualForm(false);
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${newAddr.address}"!`);
  };

  const handleUseCurrentGpsCheckout = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (res.ok) {
            const data = await res.json();
            address = data.display_name?.split(',').slice(0, 4).join(', ') || address;
          }
        } catch {}
        const gpsAddrObj = { title: 'Current Location', address, city: '', isDefault: false, isGps: true };
        const updated = [gpsAddrObj, ...savedAddresses.filter(a => !a.isGps)];
        setSavedAddresses(updated);
        try { localStorage.setItem(getAddressesKey(activeUser?.phone), JSON.stringify(updated)); } catch {}
        const formatted = { title: 'Current Location', name: currentName, phone: currentPhone, address, tag: 'GPS LOCATION', time: '15-25 min delivery' };
        setSelectedAddress(formatted);
        setIsLocatingGps(false);
        setIsLocationModalOpen(false);
        showToast('Location detected via GPS!');
      },
      () => {
        setIsLocatingGps(false);
        showToast('Could not detect location. Please enter manually.');
        setShowManualForm(true);
      },
      { timeout: 10000 }
    );
  };

  const handlePlaceOrder = async () => {
    if (!items || items.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    if (!selectedAddress || !selectedAddress.address) {
      showToast('Please add or choose a delivery address first.');
      setIsLocationModalOpen(true);
      return;
    }
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `GB-${randomNum}`;
    const rawId = `ord-${Date.now()}`;
    const orderItems = items.map((i) => ({
      id: i.id,
      name: i.name || i.product_name || 'Express Grocery Item',
      product_name: i.name || i.product_name || 'Express Grocery Item',
      qty: Number(i.qty || i.quantity) || 1,
      quantity: Number(i.qty || i.quantity) || 1,
      price: Number(i.price) || 0,
      image: i.image,
    }));

    const custName = selectedAddress.name || currentName || 'Customer';
    const rawPhoneDigits = (selectedAddress.phone || currentPhone || '').replace(/\D/g, '');
    const validPhoneDigits = rawPhoneDigits.length >= 10 ? rawPhoneDigits.slice(-10) : (rawPhoneDigits || '9876543210');
    const fullAddrStr = selectedAddress.address + (selectedAddress.city ? `, ${selectedAddress.city}` : '');

    const newOrderObj = {
      id: newOrderId,
      orderNumber: newOrderId,
      rawId: rawId,
      store_id: 'b5c9ff6b-1f64-405f-a25d-54dc6ea77bbb',
      store_name: 'GrabIt Supermarket',
      customer_name: custName,
      customer_phone: `+91${validPhoneDigits}`,
      total_amount: Number(toPay) || 0,
      total: Number(toPay) || 0,
      subtotal: Number(itemTotal) || 0,
      delivery_fee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      status: 'placed',
      item_count: totalItems,
      items: orderItems,
      delivery_address: fullAddrStr,
      address: fullAddrStr,
      payment_method: (selectedPayment || 'upi').toUpperCase(),
      estimated_time: selectedAddress.time || '15-25 min delivery',
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let finalOrder = { ...newOrderObj };

    try {
      const apiRes = await post('/orders/', {
        store_id: 'b5c9ff6b-1f64-405f-a25d-54dc6ea77bbb',
        total_amount: Number(toPay) || 0,
        delivery_address: fullAddrStr,
        items: orderItems,
        customer_name: newOrderObj.customer_name,
        customer_phone: newOrderObj.customer_phone,
        payment_method: newOrderObj.payment_method,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'placed',
      }).catch(() => null);

      if (apiRes && apiRes.id) {
        finalOrder.id = apiRes.id;
        finalOrder.rawId = apiRes.id;
        finalOrder.orderNumber = apiRes.id;
      }
    } catch (e) {
      console.warn('Live order save fallback:', e);
    }

    try {
      const storageKey = validPhoneDigits ? `grabit_orders_${validPhoneDigits}` : 'grabit_orders_guest';
      const existingUser = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const filteredUser = existingUser.filter(o => o.rawId !== rawId && o.id !== newOrderId && o.id !== finalOrder.id);
      localStorage.setItem(storageKey, JSON.stringify([finalOrder, ...filteredUser]));

      const globalExisting = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const filteredGlobal = globalExisting.filter(o => o.rawId !== rawId && o.id !== newOrderId && o.id !== finalOrder.id);
      localStorage.setItem('grabit_orders', JSON.stringify([finalOrder, ...filteredGlobal]));

      const cached = JSON.parse(sessionStorage.getItem('grabit_fast_orders_cache') || '[]');
      sessionStorage.setItem('grabit_fast_orders_cache', JSON.stringify([finalOrder, ...cached]));

      // Add genuine real-time user notification
      const trackId = finalOrder.id || newOrderId;
      addUserNotification({
        title: 'Order Placed',
        message: `Order #${trackId} received. Store is preparing your items.`,
        link: `/orders/track/${trackId}`,
        orderId: trackId,
        category: 'active',
        statusBadge: '⚡ ~15-20 min',
        statusColor: '#0071E3',
        statusBg: '#EFF6FF',
        iconType: 'package'
      });

      window.dispatchEvent(new Event('grabit_orders_updated'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
      window.dispatchEvent(new Event('grabit_notifications_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Local order storage error:', e);
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

  // Guard against navigating directly to checkout with an empty cart
  if (!orderPlaced && (!items || items.length === 0)) {
    return (
      <div className="container section" style={{ paddingTop: '60px', paddingBottom: '80px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EFF6FF', color: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '400px', margin: '0 auto 24px' }}>
          Looks like you don't have any items in your cart to checkout. Add some fresh groceries to get started!
        </p>
        <Link
          to="/"
          style={{ background: '#0071E3', color: '#FFFFFF', textDecoration: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          Explore Groceries
        </Link>
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
        <button
          className="btn btn-primary btn-lg"
          disabled={!items || items.length === 0}
          style={{ width: '100%', marginTop: '16px', justifyContent: 'center', background: (!items || items.length === 0) ? '#94A3B8' : '#0071E3', borderRadius: '12px', fontWeight: 900, minHeight: '46px', display: 'flex', alignItems: 'center', gap: '8px', cursor: (!items || items.length === 0) ? 'not-allowed' : 'pointer' }}
          onClick={handlePlaceOrder}
        >
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
    <div className="container section" style={{ paddingTop: isMobile ? '80px' : '44px', minHeight: '100vh' }}>

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', marginTop: isMobile ? '24px' : '16px', paddingTop: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, margin: 0, color: '#0F172A' }}>{STEPS[step]}</h1>
        </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Delivery Address Re-confirmation Badge */}
              {selectedAddress && selectedAddress.address ? (
                <div style={{
                  background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '14px',
                  padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#16A34A" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 900, color: '#166534' }}>
                        Delivery Address Confirmed: {selectedAddress.title || 'Home'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>
                        {selectedAddress.address}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    style={{
                      background: '#FFFFFF', border: '1px solid #86EFAC', borderRadius: '8px',
                      padding: '5px 12px', fontSize: '11.5px', fontWeight: 800, color: '#16A34A', cursor: 'pointer'
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : null}

              {appliedCoupon && (
                <div style={{
                  background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px',
                  padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={16} color="#0071E3" />
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E40AF' }}>
                      Coupon <strong>{appliedCoupon.code || appliedCoupon}</strong> Active — Saving ₹{couponDiscount}
                    </span>
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '6px', fontWeight: 900 }}>
                    APPLIED
                  </span>
                </div>
              )}

              <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>
                  <MapPin size={20} color="#0071E3" /> 1. Select Delivery Address
                </h3>
                
                {/* Active Delivery Address Box (INTERACTIVE & MOBILE RESPONSIVE) */}
                {selectedAddress && selectedAddress.address ? (
                  <div style={{ border: '2px solid #0071E3', borderRadius: '16px', padding: isMobile ? '14px' : '16px', background: '#EFF6FF', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap' }}>🏠 {selectedAddress?.title || 'Home'} (Selected)</span>
                        <span style={{ fontSize: '10px', background: '#0071E3', color: '#FFFFFF', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{selectedAddress?.tag || 'SAVED'}</span>
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
                      <strong style={{ color: '#0F172A' }}>{selectedAddress.name || currentName}</strong> • {selectedAddress.phone || currentPhone}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '24px 16px', border: '2px dashed #CBD5E1', borderRadius: '16px', background: '#F8FAFC', textAlign: 'center', marginBottom: '14px' }}>
                    <MapPin size={32} color="#0071E3" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>No Delivery Address Added</div>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px' }}>Please set your delivery address or pin on map to place your order.</p>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      style={{ padding: '10px 18px', background: '#0071E3', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={15} /> Add Delivery Address
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px dashed #0071E3', borderRadius: '12px', color: '#0071E3', fontWeight: 800, fontSize: '13.5px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Choose / Add New Address
                </button>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px 14px', marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12.5px', color: '#065F46', fontWeight: 700 }}>
                  <Check size={16} color="#10B981" style={{ flexShrink: 0 }} /> Express delivery in {selectedAddress?.time || '15-25 min delivery'} within 5 km radius.
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
                <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>{selectedAddress?.title || 'Selected Address'} • {selectedAddress?.address || 'No location selected'}</div>
                <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, marginTop: '2px' }}>{selectedAddress?.time || '15-25 min delivery'}</div>
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
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '450px', width: '100%',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
            position: 'relative', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto'
          }}>
            {/* Sticky Close Button */}
            <button
              onClick={() => { setIsLocationModalOpen(false); setShowManualForm(false); }}
              style={{
                position: 'sticky', top: '0px', float: 'right',
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#F1F5F9', border: 'none', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#334155', transition: 'all 0.15s ease', zIndex: 50,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                margin: '16px 16px 0 auto'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
            >
              <X size={18} strokeWidth={2.4} color="#334155" />
            </button>

            <div style={{ padding: '24px' }}>
              {/* Welcoming centered header — Image 1 style */}
              <div style={{ textAlign: 'center', marginBottom: '22px', paddingTop: '4px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                  color: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', boxShadow: '0 8px 20px -4px rgba(0,113,227,0.25)'
                }}>
                  <MapPin size={26} strokeWidth={2.4} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  Select Delivery Location
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Add your delivery address to see live stock availability and 10-minute delivery in your area.
                </p>
              </div>

              {/* Saved address cards (if any) */}
              {savedAddresses.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
                  {savedAddresses.map((addr, idx) => {
                    const isSelected = selectedAddress?.title === addr.title;
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
                            <MapPin size={14} color={isSelected ? '#0071E3' : '#64748B'} />
                            <span style={{ fontSize: '13px', fontWeight: 900, color: isSelected ? '#0071E3' : '#0F172A' }}>{addr.title}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: 600 }}>{addr.address}</div>
                        </div>
                        {isSelected && <CheckCircle2 size={20} color="#0071E3" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3 action buttons matching Image 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: showManualForm ? '14px' : '0' }}>
                {/* BUTTON 1: Use Current Location (GPS) */}
                <button
                  type="button"
                  onClick={handleUseCurrentGpsCheckout}
                  disabled={isLocatingGps}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none',
                    background: isLocatingGps ? '#EFF6FF' : 'linear-gradient(135deg, #0071E3 0%, #0056B3 100%)',
                    color: isLocatingGps ? '#0071E3' : '#FFFFFF',
                    fontSize: '14px', fontWeight: 900, cursor: isLocatingGps ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: isLocatingGps ? 'none' : '0 6px 18px rgba(0,113,227,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Navigation size={18} fill={isLocatingGps ? 'none' : '#FFFFFF'} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, lineHeight: 1.2 }}>
                      {isLocatingGps ? 'Detecting GPS...' : 'Use Current Location'}
                    </div>
                    <div style={{ fontSize: '11px', opacity: isLocatingGps ? 0.7 : 0.9, fontWeight: 600 }}>
                      Detect device GPS & fetch street address
                    </div>
                  </div>
                </button>

                {/* BUTTON 2: Set Address / Pin on Map — placeholder */}
                <button
                  type="button"
                  onClick={() => showToast('Map picker coming soon!')}
                  style={{
                    width: '100%', padding: '12px 18px', borderRadius: '16px',
                    border: '1.5px solid #0071E3', background: '#FFFFFF',
                    color: '#0071E3', fontSize: '14px', fontWeight: 900, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  <MapPin size={18} strokeWidth={2.4} color="#0071E3" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, lineHeight: 1.2 }}>Set Address / Pin on Map</div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Interactive map picker & address search</div>
                  </div>
                </button>

                {/* BUTTON 3: Enter Address Details Manually */}
                <button
                  type="button"
                  onClick={() => setShowManualForm(f => !f)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px',
                    border: '1px dashed #CBD5E1', background: '#F8FAFC',
                    color: '#0071E3', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F7FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  <Plus size={16} /> Enter Address Details Manually
                </button>
              </div>

              {/* Manual form — shown when button 3 is clicked */}
              {showManualForm && (
                <form onSubmit={handleAddCustomAddress} style={{ marginTop: '4px' }}>
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
                        autoFocus
                        style={{
                          width: '100%', height: '42px', borderRadius: '12px',
                          border: '1.5px solid #0071E3', paddingLeft: '38px', paddingRight: '12px',
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
                    Save & Select New Location
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      {/* ── COUPON BACK NAVIGATION WARNING MODAL ── */}
      {showCouponBackWarningModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Tag size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Returning to Cart?
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              You currently have coupon <strong style={{ color: '#0071E3' }}>{appliedCoupon?.code || appliedCoupon}</strong> applied (saving ₹{couponDiscount}).
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px', textAlign: 'left', marginBottom: '20px', fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
              💡 <strong>Note:</strong> Your coupon and selected delivery address (<em style={{ color: '#0F172A' }}>{selectedAddress?.title || 'Saved Address'}</em>) are preserved. However, if you change items or cart total in your cart, coupon eligibility will be re-evaluated.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCouponBackWarningModal(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '12px',
                  background: '#0071E3', color: '#FFFFFF', border: 'none',
                  fontSize: '13px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                Stay on Checkout
              </button>
              <button
                type="button"
                onClick={handleConfirmBackToCart}
                style={{
                  flex: 1, padding: '11px', borderRadius: '12px',
                  background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1',
                  fontSize: '13px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
