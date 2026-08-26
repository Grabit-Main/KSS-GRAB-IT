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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({
    title: 'Home',
    name: 'Rahul Sharma',
    phone: '99999 00004',
    address: '#12, 3rd Cross, Banaswadi Main Road, Banaswadi, Bengaluru 560043, Karnataka',
    tag: 'WITHIN 5 KM RADIUS',
    time: '30-45 min delivery'
  });

  const [customAddressInput, setCustomAddressInput] = useState('');

  const savedAddresses = [
    {
      title: 'Home',
      name: 'Rahul Sharma',
      phone: '99999 00004',
      address: '#12, 3rd Cross, Banaswadi Main Road, Banaswadi, Bengaluru 560043, Karnataka',
      tag: 'WITHIN 5 KM RADIUS',
      time: '30-45 min delivery',
      isDefault: true
    },
    {
      title: 'Work Office',
      name: 'Rahul (Office)',
      phone: '99999 00004',
      address: 'Suite 402, 100ft Road, Indiranagar, Bengaluru 560038',
      tag: 'WITHIN 3.8 KM RADIUS',
      time: '15-25 min delivery',
      isDefault: false
    }
  ];

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr);
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to ${addr.title}!`);
  };

  const handleAddCustomAddress = (e) => {
    e.preventDefault();
    if (!customAddressInput.trim()) return;
    const newAddr = {
      title: 'Custom Location',
      name: 'Rahul Sharma',
      phone: '99999 00004',
      address: customAddressInput,
      tag: 'WITHIN 5 KM RADIUS',
      time: '20-30 min delivery',
      isDefault: false
    };
    setSelectedAddress(newAddr);
    setCustomAddressInput('');
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${newAddr.address}"!`);
  };

  const handlePlaceOrder = async () => {
    try {
      await post('/orders/', {
        total_amount: toPay,
        delivery_address: selectedAddress.address,
        payment_method: selectedPayment,
      });
    } catch (e) {
      console.warn('Live order save fallback:', e);
    }
    setOrderPlaced(true);
    clearCart();
    setTimeout(() => navigate('/orders'), 2500);
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
                
                {/* Active Delivery Address Box (INTERACTIVE) */}
                <div style={{ border: '2px solid #0071E3', borderRadius: '16px', padding: '16px', background: '#EFF6FF', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} /></div>
                      <span style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>🏠 {selectedAddress.title} (Selected)</span>
                      <span style={{ fontSize: '9px', background: '#0071E3', color: '#FFF', fontWeight: 900, padding: '2px 8px', borderRadius: '6px' }}>{selectedAddress.tag}</span>
                    </div>
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      style={{ color: '#0071E3', fontSize: '12.5px', fontWeight: 900, background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                  onClick={() => setIsLocationModalOpen(true)}
                  style={{ width: '100%', padding: '14px', border: '1.5px dashed #0071E3', borderRadius: '12px', color: '#0071E3', fontWeight: 900, fontSize: '13.5px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Choose / Add New Address
                </button>

                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px 14px', marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12.5px', color: '#065F46', fontWeight: 800 }}>
                  <Check size={16} color="#10B981" /> Express delivery in {selectedAddress.time} within 5 km radius.
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
