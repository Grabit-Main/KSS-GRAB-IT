import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Pencil, Plus, Minus, Trash2, Tag, ChevronRight, X, CheckCircle2, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import { products } from '../data/products';
import useWindowWidth from '../hooks/useWindowWidth';

export default function CartPage() {
  const { items, updateQty, removeItem, itemTotal, discount, deliveryFee, toPay, totalItems } = useCart();
  const { showToast } = useToast();
  const recommended = products.slice(0, 6);
  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

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
      address: def.address + (def.city ? `, ${def.city}` : ''),
      tag: 'Direct Delivery',
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
      address: fullAddressText,
      tag: 'Saved Location',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${fullAddressText}"!`);
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
      address: fullAddrStr,
      tag: 'Edited Location',
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
      address: customText,
      tag: 'Custom Location',
      time: '15-25 min delivery'
    };
    setSelectedAddress(formatted);
    setCustomAddressInput('');
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to "${customText}"!`);
  };

  return (
    <div className="container section" style={{ paddingTop: isMobile ? '24px' : '24px', paddingBottom: isMobile ? '90px' : '40px' }}>

      <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, marginBottom: '6px', color: '#0F172A' }}>
        My Cart ({totalItems} Items)
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', flexWrap: 'wrap' }}>
        <MapPin size={14} color="#0071E3" />
        <span>Delivering to <strong style={{ color: '#0F172A' }}>{selectedAddress.address}</strong></span>
        <span style={{ color: '#0071E3', fontWeight: 800 }}>• {selectedAddress.tag}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state card card-body" style={{ padding: isMobile ? '32px 16px' : '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>Your cart is empty</h3>
          <p style={{ color: '#64748B', marginBottom: '20px' }}>Add items from the store to continue shopping</p>
          <Link to="/" className="btn btn-primary" style={{ minHeight: '44px', background: '#0071E3', borderRadius: '12px', fontWeight: 900 }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '20px', alignItems: 'flex-start' }}>
          {/* ── CART ITEMS ── */}
          <div>
            <div className="card" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {items.map((item, idx) => (
                <div key={item.id}>
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '12px' : '16px',
                    padding: isMobile ? '14px' : '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                      <div style={{ width: '60px', height: '60px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                        <ProductSvg name={item.image} size={48} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '2px', color: '#0F172A' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>{item.weight}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>₹{item.price}</span>
                          {item.mrp > item.price && <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{item.mrp}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: isMobile ? '100%' : 'auto',
                      gap: '12px',
                      paddingTop: isMobile ? '8px' : '0',
                      borderTop: isMobile ? '1px dashed #F1F5F9' : 'none'
                    }}>
                      <div className="qty-control" style={{ background: '#F1F5F9', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: '32px', height: '32px' }}><Minus size={12} /></button>
                        <span className="qty-value" style={{ fontWeight: 900 }}>{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: '32px', height: '32px' }}><Plus size={12} /></button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 900, fontSize: '15px', color: '#0F172A' }}>₹{item.price * item.qty}</span>
                        <button onClick={() => removeItem(item.id)} style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', padding: '6px' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx < items.length - 1 && <div className="divider" style={{ margin: '0 16px', borderColor: '#F1F5F9' }} />}
                </div>
              ))}
            </div>
            {discount > 0 && (
              <div className="savings-banner" style={{ marginTop: '14px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={16} color="#10B981" />
                Yay! You saved ₹{discount} on this order
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Delivery Details Card (CLICKABLE & INTERACTIVE) */}
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="card card-body"
              style={{
                background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 900, fontSize: '14px', color: '#0F172A' }}>Delivery Details</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsLocationModalOpen(true); }}
                  style={{
                    color: '#0071E3', fontSize: '12px', fontWeight: 900,
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Pencil size={12} color="#0071E3" /> Edit
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <MapPin size={16} color="#0071E3" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{selectedAddress.address}</div>
                  <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, marginTop: '1px' }}>{selectedAddress.tag}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <Zap size={14} color="#0071E3" fill="#0071E3" />
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedAddress.time}
                </div>
              </div>
            </div>

            {/* Bill Details Card */}
            <div className="card card-body" style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 900, fontSize: '15px', color: '#0F172A' }}>Bill Details</span>
              </div>
              <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', color: '#475569' }}>
                <span>Item Total ({totalItems} items)</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{itemTotal}</span>
              </div>
              <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', color: '#475569' }}>
                <span>Discount</span>
                <span style={{ color: '#10B981', fontWeight: 900 }}>-₹{discount}</span>
              </div>
              <div className="bill-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', color: '#475569' }}>
                <span>Delivery Fee</span>
                <span style={{ color: '#10B981', fontWeight: 900 }}>FREE</span>
              </div>
              <div className="divider" style={{ margin: '10px 0', borderColor: '#E2E8F0' }} />
              <div className="bill-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 900, paddingTop: '4px', color: '#0F172A' }}>
                <span>To Pay</span>
                <span style={{ color: '#0071E3' }}>₹{toPay}</span>
              </div>
              <Link
                to="/checkout"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%', marginTop: '16px', justifyContent: 'center',
                  minHeight: '46px', display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#0071E3', borderRadius: '12px', fontWeight: 900,
                  fontSize: '14.5px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,113,227,0.3)'
                }}
              >
                Proceed to Checkout <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 🌟 INTERACTIVE DELIVERY LOCATION & ADDRESS EDIT MODAL ── */}
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
