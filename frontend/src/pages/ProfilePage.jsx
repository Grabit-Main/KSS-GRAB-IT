import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, ShoppingBag, MessageSquare, Heart, Wallet, ChevronRight, 
  Settings, RefreshCw, CreditCard, MapPin, Gift, Sliders, Star, 
  Bell, Info, LogOut, ArrowLeft, Check, Sparkles, X, Plus, Edit2, ShieldCheck, CheckCircle2,
  Store, Truck, LogIn
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useWindowWidth from '../hooks/useWindowWidth';
import { forceScrollToTop } from '../utils/scrollToTop';
import { 
  DEFAULT_CUSTOMER_ADDRESSES,
  loadCustomerAddresses,
  saveCustomerAddresses,
  getCustomerAddressKey
} from '../utils/addressManager';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const w = useWindowWidth();
  const isMobile = w <= 768;

  useEffect(() => {
    forceScrollToTop();
  }, []);

  const getStoredUser = () => {
    try {
      const u = localStorage.getItem('grabit_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const initialUser = getStoredUser();
  // ── USER STATE & WALLET ──
  const [userName, setUserName] = useState(initialUser?.full_name || initialUser?.name || 'Customer');
  const [userPhone, setUserPhone] = useState(initialUser?.phone || '');
  const [userEmail, setUserEmail] = useState(initialUser?.email || '');
  const [walletBalance, setWalletBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('100');
  const [activeAppIcon, setActiveAppIcon] = useState('Default Grabit Blue');

  // Sync profile when auth state updates
  useState(() => {
    const syncUser = () => {
      const u = getStoredUser();
      if (u) {
        setUserName(u.full_name || u.name || 'Customer');
        setUserPhone(u.phone || '');
        setUserEmail(u.email || '');
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('grabit_auth_updated', syncUser);
      window.addEventListener('storage', syncUser);
    }
  });

  // ── MODAL VISIBILITY STATES ──
  const [activeModal, setActiveModal] = useState(null); // 'add-balance' | 'refunds' | 'gift-cards' | 'addresses' | 'edit-profile' | 'rewards' | 'payments' | 'app-icon' | 'suggest' | 'notifications' | 'info'

  // ── NOTIFICATION TOGGLES ──
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifPrice, setNotifPrice] = useState(false);

  // ── SUGGEST PRODUCT INPUT ──
  const [suggestInput, setSuggestInput] = useState('');

  // ── GIFT CARD CODE ──
  const [giftCardCode, setGiftCardCode] = useState('');

  // ── SAVED ADDRESSES STATE (Dynamic per user account) ──
  const getAddressesKey = (phone) => getCustomerAddressKey(phone || userPhone);
  const loadUserAddresses = (phone) => loadCustomerAddresses(phone || userPhone);

  const [profileAddresses, setProfileAddresses] = useState(() => loadUserAddresses(initialUser?.phone));
  const [editingAddrIdx, setEditingAddrIdx] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editAddrForm, setEditAddrForm] = useState({ title: '', address: '', city: '', isDefault: false });

  // Sync profile addresses when updated from Header or Checkout
  useState(() => {
    const syncAddresses = () => {
      setProfileAddresses(loadUserAddresses(userPhone));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('grabit_addresses_updated', syncAddresses);
      window.addEventListener('storage', syncAddresses);
    }
  });

  const handleStartEditAddress = (idx, addr) => {
    setEditingAddrIdx(idx);
    setIsAddingAddress(false);
    setEditAddrForm({ title: addr.title || addr.tag || 'Home', address: addr.address, city: addr.city || 'Bengaluru', isDefault: addr.isDefault || false });
  };

  const handleStartAddAddress = () => {
    setEditingAddrIdx(null);
    setIsAddingAddress(true);
    setEditAddrForm({ title: 'Home', address: '', city: 'Bengaluru', isDefault: profileAddresses.length === 0 });
  };

  const handleSaveEditAddress = (e) => {
    e.preventDefault();
    if (!editAddrForm.address.trim()) {
      showToast('Please enter the delivery address.');
      return;
    }

    let updated = [...profileAddresses];
    const newAddr = {
      id: Date.now(),
      title: editAddrForm.title.trim() || 'Home',
      tag: editAddrForm.title.trim() || 'Home',
      address: editAddrForm.address.trim(),
      area: editAddrForm.address.split(',')[0] || 'Koramangala',
      city: editAddrForm.city.trim() || 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      time: '15-25 min delivery',
      radius: '5 km',
      isDefault: editAddrForm.isDefault || false
    };

    if (isAddingAddress) {
      if (newAddr.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }
      updated.push({ ...newAddr, isDefault: newAddr.isDefault || updated.length === 0 });
      showToast(`Address "${newAddr.title}" saved successfully!`);
    } else if (editingAddrIdx !== null) {
      if (newAddr.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }
      updated[editingAddrIdx] = { ...updated[editingAddrIdx], ...newAddr };
      showToast(`Address "${newAddr.title}" updated successfully!`);
    }

    setProfileAddresses(updated);
    saveCustomerAddresses(updated, userPhone);
    setEditingAddrIdx(null);
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = (idx) => {
    const updated = profileAddresses.filter((_, i) => i !== idx);
    setProfileAddresses(updated);
    saveCustomerAddresses(updated, userPhone);
    showToast('Delivery address removed.');
  };

  const handleLogout = () => {
    localStorage.removeItem('grabit_session');
    localStorage.removeItem('grabit_user');
    try {
      window.dispatchEvent(new CustomEvent('grabit_auth_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    showToast('Logged out of Grabit successfully!');
    setTimeout(() => navigate('/login'), 600);
  };

  const handleAddBalance = (e) => {
    e.preventDefault();
    const amt = parseFloat(addAmount) || 0;
    if (amt > 0) {
      setWalletBalance(prev => prev + amt);
      showToast(`Added ₹${amt} to Grabit Cash! New Balance: ₹${walletBalance + amt}`);
      setActiveModal(null);
    }
  };

  const handleClaimGiftCard = (e) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    setWalletBalance(prev => prev + 200);
    showToast(`Successfully claimed Gift Card ₹200! Added to Grabit Cash.`);
    setGiftCardCode('');
    setActiveModal(null);
  };

  const handleSuggestSubmit = (e) => {
    e.preventDefault();
    if (!suggestInput.trim()) return;
    showToast(`Thank you! "${suggestInput}" requested. We'll add it soon!`);
    setSuggestInput('');
    setActiveModal(null);
  };

  return (
    <div style={{ background: '#F4F5F8', minHeight: '100vh', padding: isMobile ? '8px 10px 0' : '12px 14px 0' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* ── 1. HEADER BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '12px 0 18px', marginBottom: '8px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Profile</h1>
        </div>

        {/* ── 2. USER PROFILE SUMMARY ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          marginBottom: '20px', padding: '4px 2px'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071E3 0%, #0058B3 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0, 113, 227, 0.25)', flexShrink: 0
          }}>
            <User size={32} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
              {userName}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 600 }}>
              {userPhone}
            </p>
          </div>
        </div>

        {/* ── 3. TOP 3 QUICK ACTION CARDS ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
          marginBottom: '16px'
        }}>
          {/* Card 1: Your Orders */}
          <div
            onClick={() => navigate('/orders')}
            style={{
              background: '#FFFFFF', borderRadius: '16px', padding: '16px 10px',
              textAlign: 'center', border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <ShoppingBag size={22} color="#0071E3" />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Your<br />Orders
            </span>
          </div>

          {/* Card 2: Help & Support */}
          <div
            onClick={() => navigate('/help')}
            style={{
              background: '#FFFFFF', borderRadius: '16px', padding: '16px 10px',
              textAlign: 'center', border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <MessageSquare size={22} color="#0071E3" />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Help &amp;<br />Support
            </span>
          </div>

          {/* Card 3: Your Wishlist */}
          <div
            onClick={() => navigate('/wishlist')}
            style={{
              background: '#FFFFFF', borderRadius: '16px', padding: '16px 10px',
              textAlign: 'center', border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <Heart size={22} color="#0071E3" />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Your<br />Wishlist
            </span>
          </div>
        </div>

        {/* ── 4. GRABIT CASH & GIFT CARD BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)',
          borderRadius: '18px', border: '1px solid #BFDBFE',
          padding: '16px 18px', marginBottom: '14px',
          boxShadow: '0 2px 10px rgba(0, 113, 227, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: '#0071E3', color: '#FFFFFF', borderRadius: '8px',
                padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Wallet size={16} color="#FFFFFF" />
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                Grabit Cash &amp; Gift Card
              </span>
              <span style={{
                background: '#10B981', color: '#FFFFFF', fontSize: '9px',
                fontWeight: 900, padding: '2px 6px', borderRadius: '4px',
                letterSpacing: '0.4px'
              }}>
                NEW
              </span>
            </div>
            <ChevronRight size={18} color="#0071E3" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Available Balance</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>₹{walletBalance}</span>
            </div>
            <button
              onClick={() => setActiveModal('add-balance')}
              style={{
                background: '#FFFFFF', border: '1.5px solid #0071E3',
                borderRadius: '10px', padding: '6px 14px', fontSize: '12px',
                fontWeight: 900, color: '#0071E3', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,113,227,0.1)', transition: 'all 0.15s ease'
              }}
            >
              Add Balance
            </button>
          </div>
        </div>

        {/* ── 5. UPDATE AVAILABLE BANNER ── */}


        {/* ── 6. YOUR INFORMATION SECTION ── */}
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 4px' }}>
            Your Information
          </h3>

          <div style={{
            background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden'
          }}>
            {[
              {
                icon: <RefreshCw size={18} color="#0F172A" />,
                title: 'Your Refunds',
                desc: null,
                action: () => setActiveModal('refunds')
              },
              {
                icon: <Heart size={18} color="#0F172A" />,
                title: 'Your Wishlist',
                desc: null,
                action: () => navigate('/wishlist')
              },
              {
                icon: <CreditCard size={18} color="#0F172A" />,
                title: 'E-Gift Cards',
                desc: null,
                action: () => setActiveModal('gift-cards')
              },
              {
                icon: <MessageSquare size={18} color="#0F172A" />,
                title: 'Help & Support',
                desc: null,
                action: () => navigate('/help')
              },
              {
                icon: <MapPin size={18} color="#0F172A" />,
                title: 'Saved Addresses',
                desc: profileAddresses.length > 0 ? `${profileAddresses.length} ${profileAddresses.length === 1 ? 'Address' : 'Addresses'}` : '0 Addresses',
                action: () => setActiveModal('addresses')
              },
              {
                icon: <User size={18} color="#0F172A" />,
                title: 'Profile',
                desc: null,
                action: () => setActiveModal('edit-profile')
              },
              {
                icon: <Gift size={18} color="#0F172A" />,
                title: 'Rewards',
                desc: null,
                action: () => setActiveModal('rewards')
              },
              {
                icon: <CreditCard size={18} color="#0F172A" />,
                title: 'Payment Management',
                desc: null,
                action: () => setActiveModal('payments')
              }
            ].map((item, idx, arr) => (
              <div
                key={item.title}
                onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: idx < arr.length - 1 ? '1px dashed #F1F5F9' : 'none',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #E2E8F0'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{item.title}</div>
                    {item.desc && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{item.desc}</div>}
                  </div>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. LOG OUT BUTTON & VERSION FOOTER ── */}
        <div style={{ textAlign: 'center', padding: '4px 0 2px', margin: '0 0 0' }}>
          <button
            onClick={handleLogout}
            style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '12px', padding: '7px 20px',
              fontSize: '12.5px', fontWeight: 800, color: '#EF4444',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '8px'
            }}
          >
            <LogOut size={14} /> Log Out
          </button>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.2px', margin: 0, padding: 0 }}>
            App version 0.0.1
          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 🌟 ALL 12 FULLY INTERACTIVE MODALS FOR PROFILE OPTIONS */}
      {/* ───────────────────────────────────────────────────────────────── */}

      {/* 1. ADD BALANCE MODAL */}
      {activeModal === 'add-balance' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px', color: '#0F172A' }}>Top-up Grabit Cash</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Add money for 1-click checkout on all grocery orders.</p>
            <form onSubmit={handleAddBalance}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['100', '250', '500', '1000'].map(amt => (
                  <button key={amt} type="button" onClick={() => setAddAmount(amt)} style={{ flex: 1, padding: '10px 0', borderRadius: '12px', border: addAmount === amt ? '2px solid #0071E3' : '1px solid #E2E8F0', background: addAmount === amt ? '#EFF6FF' : '#FFFFFF', color: addAmount === amt ? '#0071E3' : '#0F172A', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>₹{amt}</button>
                ))}
              </div>
              <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="Custom Amount" style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '14px', fontWeight: 800, outline: 'none', marginBottom: '14px' }} />
              <button type="submit" style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Proceed to Pay ₹{addAmount || 0}</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. YOUR REFUNDS MODAL */}
      {activeModal === 'refunds' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 16px', color: '#0F172A' }}>Your Refunds</h3>
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>Order #GB-8921</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '10px' }}>PROCESSED</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>₹140 refunded to original source (UPI) on 24 Aug 2026.</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>No other pending refund requests.</div>
          </div>
        </div>
      )}

      {/* 3. E-GIFT CARDS MODAL */}
      {activeModal === 'gift-cards' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px', color: '#0F172A' }}>Grabit E-Gift Cards</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Redeem gift vouchers or send gift cards to friends.</p>
            <form onSubmit={handleClaimGiftCard}>
              <input type="text" value={giftCardCode} onChange={e => setGiftCardCode(e.target.value)} placeholder="Enter 16-digit Gift Card Voucher Code" style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '13px', fontWeight: 800, outline: 'none', marginBottom: '14px' }} />
              <button type="submit" style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13.5px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Claim Voucher (Get ₹200)</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SAVED ADDRESSES MODAL WITH ADD, EDIT & DELETE */}
      {activeModal === 'addresses' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setActiveModal(null); setEditingAddrIdx(null); setIsAddingAddress(false); }} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#0F172A" /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 14px', color: '#0F172A' }}>
              {isAddingAddress ? 'Add New Delivery Address' : editingAddrIdx !== null ? 'Edit Delivery Address' : 'Saved Delivery Locations'}
            </h3>

            {(isAddingAddress || editingAddrIdx !== null) ? (
              <form onSubmit={handleSaveEditAddress}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Address Title</label>
                  <input type="text" placeholder="e.g. Home, Work, Apartment" value={editAddrForm.title} onChange={e => setEditAddrForm({ ...editAddrForm, title: e.target.value })} style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>Street / House / Building Address</label>
                  <input type="text" placeholder="Flat No, Building, Street Name" value={editAddrForm.address} onChange={e => setEditAddrForm({ ...editAddrForm, address: e.target.value })} style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }} required />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>City, State &amp; Pincode</label>
                  <input type="text" placeholder="e.g. Bengaluru, Karnataka 560043" value={editAddrForm.city} onChange={e => setEditAddrForm({ ...editAddrForm, city: e.target.value })} style={{ width: '100%', height: '40px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontWeight: 700, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input type="checkbox" id="addrDef" checked={editAddrForm.isDefault} onChange={e => setEditAddrForm({ ...editAddrForm, isDefault: e.target.checked })} style={{ cursor: 'pointer' }} />
                  <label htmlFor="addrDef" style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>Set as Default Delivery Address</label>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => { setEditingAddrIdx(null); setIsAddingAddress(false); }} style={{ flex: 1, background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: '#0071E3', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>{isAddingAddress ? 'Save Address' : 'Save Changes'}</button>
                </div>
              </form>
            ) : (
              <>
                {profileAddresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 16px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', marginBottom: '16px' }}>
                    <MapPin size={32} color="#94A3B8" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>No saved addresses</div>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Add your real delivery address to receive quick 10-minute grocery delivery.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {profileAddresses.map((addr, i) => (
                      <div key={i} style={{ background: addr.isDefault ? '#EFF6FF' : '#F8FAFC', borderRadius: '16px', border: addr.isDefault ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: addr.isDefault ? '#0071E3' : '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={16} /> {addr.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {addr.isDefault && <span style={{ fontSize: '10px', background: '#0071E3', color: '#FFF', fontWeight: 900, padding: '2px 8px', borderRadius: '10px' }}>DEFAULT</span>}
                            <button
                              type="button"
                              onClick={() => handleStartEditAddress(i, addr)}
                              style={{
                                background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px',
                                padding: '3px 8px', fontSize: '11px', fontWeight: 800, color: '#0071E3',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                              }}
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(i)}
                              style={{
                                background: '#FFFFFF', border: '1px solid #FCA5A5', borderRadius: '8px',
                                padding: '3px 8px', fontSize: '11px', fontWeight: 800, color: '#EF4444',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{addr.address}</div>
                        {addr.city && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{addr.city}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleStartAddAddress} style={{ width: '100%', background: '#F8FAFC', border: '1px dashed #0071E3', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 800, color: '#0071E3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Plus size={16} /> Add New Delivery Address</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. EDIT PROFILE MODAL */}
      {activeModal === 'edit-profile' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 16px', color: '#0F172A' }}>Edit Account Profile</h3>
            <form onSubmit={e => { e.preventDefault(); setActiveModal(null); showToast('Profile updated successfully!'); }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '14px', fontWeight: 700, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>Mobile Number</label>
                <input type="text" value={userPhone} onChange={e => setUserPhone(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '14px', fontWeight: 700, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} style={{ width: '100%', height: '42px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '14px', fontWeight: 700, outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Save Profile Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* 6. REWARDS MODAL */}
      {activeModal === 'rewards' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>🏆</div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Grabit Rewards Member</h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>Earn 1 coin for every ₹10 spent on Grabit.</p>
            </div>
            <div style={{ background: '#EFF6FF', borderRadius: '16px', padding: '14px', textAlign: 'center', border: '1px solid #BFDBFE', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>YOUR COIN BALANCE</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#0071E3' }}>250 Grabit Coins</div>
            </div>
            <button onClick={() => { showToast('Promo code GRABIT100 copied!'); setActiveModal(null); }} style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Redeem Code GRABIT100 (₹100 OFF)</button>
          </div>
        </div>
      )}

      {/* 7. PAYMENT MANAGEMENT MODAL */}
      {activeModal === 'payments' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 14px', color: '#0F172A' }}>Saved Payment Methods</h3>
            <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>Google Pay / UPI</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>akash@okaxis</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>✓ PRIMARY</span>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>HDFC Visa Credit Card</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>•••• •••• •••• 4821</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>SAVED</span>
            </div>
            <button onClick={() => { showToast('Redirecting to payment setup...'); setActiveModal(null); }} style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>+ Add New UPI / Card</button>
          </div>
        </div>
      )}

      {/* 8. CHANGE APP ICON MODAL */}
      {activeModal === 'app-icon' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 14px', color: '#0F172A' }}>Choose App Icon Theme</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { name: 'Default Grabit Blue', color: '#0071E3', icon: '⚡' },
                { name: 'Festive Gold Edition', color: '#D97706', icon: '🎁' },
                { name: 'Dark Obsidian Sleek', color: '#0F172A', icon: '🌙' },
                { name: 'Express Neon Green', color: '#10B981', icon: '🚀' }
              ].map(item => (
                <div
                  key={item.name}
                  onClick={() => {
                    setActiveAppIcon(item.name);
                    showToast(`App icon changed to "${item.name}"!`);
                    setActiveModal(null);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: '14px',
                    border: activeAppIcon === item.name ? `2px solid ${item.color}` : '1px solid #E2E8F0',
                    background: activeAppIcon === item.name ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{item.name}</span>
                  </div>
                  {activeAppIcon === item.name && <Check size={18} color={item.color} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. SUGGEST PRODUCTS MODAL */}
      {activeModal === 'suggest' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px', color: '#0F172A' }}>Suggest a Product</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Can't find an item? Tell us what to stock in your local darkstore!</p>
            <form onSubmit={handleSuggestSubmit}>
              <input type="text" value={suggestInput} onChange={e => setSuggestInput(e.target.value)} placeholder="e.g. Oat Milk, Specific Coffee Bean Brand..." style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #CBD5E1', padding: '0 14px', fontSize: '13.5px', fontWeight: 700, outline: 'none', marginBottom: '16px' }} />
              <button type="submit" style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Submit Product Suggestion</button>
            </form>
          </div>
        </div>
      )}

      {/* 10. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 16px', color: '#0F172A' }}>Notification Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {[
                { title: 'Order Tracking & Delivery Status', state: notifOrder, setter: setNotifOrder },
                { title: 'Exclusive Promos & Flash Coupons', state: notifPromo, setter: setNotifPromo },
                { title: 'Wishlist Price Drop Alerts', state: notifPrice, setter: setNotifPrice },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{item.title}</span>
                  <input type="checkbox" checked={item.state} onChange={e => item.setter(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#0071E3', cursor: 'pointer' }} />
                </div>
              ))}
            </div>
            <button onClick={() => { showToast('Notification settings saved!'); setActiveModal(null); }} style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer' }}>Save Preferences</button>
          </div>
        </div>
      )}

      {/* 11. GENERAL INFO MODAL */}
      {activeModal === 'info' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 12px', color: '#0F172A' }}>Grabit App Information</h3>
            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              Grabit is your premier 10-minute quick commerce platform delivering fresh groceries, staples, snacks &amp; electronics directly to your door in 5 km darkstore radius.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => { navigate('/help/terms'); setActiveModal(null); }} style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#0071E3', cursor: 'pointer' }}>Read Terms &amp; Conditions ›</button>
              <button onClick={() => { navigate('/help/privacy-policy'); setActiveModal(null); }} style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#0071E3', cursor: 'pointer' }}>Read Privacy Policy ›</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
