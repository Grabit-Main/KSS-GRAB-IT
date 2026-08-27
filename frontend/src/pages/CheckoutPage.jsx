import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, Check, ChevronRight, Plus, CreditCard, Smartphone, Building2, Wallet, Banknote, Tag, FileText, ArrowLeft, Pencil, X, CheckCircle2, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { post } from '../api';
import ProductSvg from '../components/common/ProductSvg';
import useWindowWidth from '../hooks/useWindowWidth';

const STEPS = ['Delivery', 'Payment', 'Review & Place Order'];

const PAYMENT_METHODS = [
  { id: 'upi', icon: <Smartphone size={18} color="#0071E3" />, label: 'UPI', sub: 'Pay using any UPI app', logos: ['GPay', 'Paytm'] },
  { id: 'card', icon: <CreditCard size={18} color="#0071E3" />, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay & more', logos: ['VISA', 'MC', 'RuPay'] },
  { id: 'netbanking', icon: <Building2 size={18} color="#0071E3" />, label: 'Net Banking', sub: 'All major banks supported' },
  { id: 'wallet', icon: <Wallet size={18} color="#0071E3" />, label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik & more' },
  { id: 'cod', icon: <Banknote size={18} color="#0071E3" />, label: 'Cash on Delivery', sub: 'Pay in cash when your order arrives' },
];

export default function CheckoutPage() {
  const { items, itemTotal, discount, deliveryFee, toPay, totalItems, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();

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

  const getAddressesKey = (phone) => `grabit_addresses_${(phone || 'default').replace(/\D/g, '')}`;
  const loadUserAddresses = () => {
    try {
      const data = localStorage.getItem(getAddressesKey(activeUser?.phone));
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { id: 1, title: 'Home', address: 'Flat 301, Sunshine Heights, 80 Feet Rd, Koramangala', city: 'Bengaluru 560034', isDefault: true },
      { id: 2, title: 'Work', address: 'Building 4, Tech Park, Outer Ring Rd, Marathahalli', city: 'Bengaluru 560103', isDefault: false }
    ];
  };

  const [savedAddresses, setSavedAddresses] = useState(loadUserAddresses);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingAddrIndex, setEditingAddrIndex] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', address: '', city: '' });
  const [customAddressInput, setCustomAddressInput] = useState('');

  const [selectedAddress, setSelectedAddress] = useState(() => {
    const list = loadUserAddresses();
    const def = list.find(a => a.isDefault) || list[0] || { title: 'Delivery Location', address: 'Koramangala 5th Block, Bengaluru' };
    return {
      title: def.title || 'Home',
      name: currentName,
      phone: currentPhone,
      address: def.address + (def.city ? `, ${def.city}` : ''),
      tag: 'DIRECT LOCATION',
      time: '15-25 min delivery'
    };
  });

  const saveAddressesToStorage = (list) => {
    setSavedAddresses(list);
    try {
      localStorage.setItem(getAddressesKey(activeUser?.phone), JSON.stringify(list));
      window.dispatchEvent(new Event('grabit_auth_updated'));
    } catch {}
  };

  const handleSelectAddress = (addr) => {
    const fullAddressText = addr.address + (addr.city ? `, ${addr.city}` : '');
    const formatted = {
      title: addr.title || 'Delivery Location',
      name: currentName,
      phone: currentPhone,
      address: fullAddressText,
      tag: 'SELECTED LOCATION',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setIsLocationModalOpen(false);
    showToast(`Delivery location set to "${fullAddressText}"!`);
  };

  const handleStartEdit = (e, addr, idx) => {
    e.stopPropagation();
    setEditingAddrIndex(idx);
    setEditForm({ title: addr.title || 'Home', address: addr.address || '', city: addr.city || '' });
  };

  const handleSaveEditedAddress = (e) => {
    e.preventDefault();
    if (!editForm.address.trim()) return;
    const updated = [...savedAddresses];
    const fullAddrStr = editForm.address.trim() + (editForm.city.trim() ? `, ${editForm.city.trim()}` : '');
    updated[editingAddrIndex] = {
      ...updated[editingAddrIndex],
      title: editForm.title.trim() || 'Home',
      address: editForm.address.trim(),
      city: editForm.city.trim()
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
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GB-${randomNum}`;
    const rawId = `ord-${Date.now()}`;
    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.qty || 1,
      quantity: item.qty || 1,
      price: item.price,
      image: item.image,
    }));

    const newOrder = {
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

    let finalOrder = { ...newOrder };

    try {
      const apiRes = await post('/orders/', {
        store_id: 'b5c9ff6b-1f64-405f-a25d-54dc6ea77bbb',
        delivery_address: selectedAddress.address,
        items: orderItems,
        total_amount: toPay,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        payment_method: newOrder.payment_method,
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'placed'
      }).catch(() => null);

      if (apiRes && apiRes.id) {
        finalOrder.id = apiRes.id;
        finalOrder.rawId = apiRes.id;
        finalOrder.orderNumber = apiRes.id;
      }
    } catch {}

    try {
      const existing = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const filtered = existing.filter(o => o.rawId !== rawId && o.id !== orderNumber && o.id !== finalOrder.id);
      localStorage.setItem('grabit_orders', JSON.stringify([finalOrder, ...filtered]));
      window.dispatchEvent(new Event('grabit_orders_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Storage sync:', e);
    }

    setOrderPlaced(true);
    clearCart();
    setTimeout(() => navigate('/orders'), 2000);
  };

  if (orderPlaced) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎉</div>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0071E3', marginBottom: '8px' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Your order is confirmed. Estimated delivery: <strong>{selectedAddress.time}</strong></p>
        <p style={{ color: '#94A3B8', marginTop: '8px' }}>Redirecting to My Orders...</p>
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
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }} /> : <ProductSvg name={item.name} category={item.category} size={28} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{item.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>Qty: {item.qty} × ₹{item.price}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>₹{item.price * item.qty}</div>
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
                {editingAddrIndex !== null ? 'Edit Delivery Address' : 'Select Delivery Location'}
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
