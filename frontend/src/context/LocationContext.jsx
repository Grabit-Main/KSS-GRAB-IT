import { createContext, useContext, useState, useEffect } from 'react';
import { MapPin, Edit2, Plus, X, Trash2, Check, Navigation, LocateFixed } from 'lucide-react';
import DeliveryLocationMapPicker from '../components/common/DeliveryLocationMapPicker';
import {
  DEFAULT_CUSTOMER_ADDRESSES,
  loadCustomerAddresses,
  saveCustomerAddresses,
  getCustomerAddressKey
} from '../utils/addressManager';

const LocationContext = createContext();

export const defaultLocationsList = DEFAULT_CUSTOMER_ADDRESSES;

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(() => loadCustomerAddresses());
  const [selectedId, setSelectedId] = useState(() => {
    const list = loadCustomerAddresses();
    const def = list.find(l => l.isDefault) || list[0];
    return def ? def.id : 1;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('list'); // 'list' | 'map'
  const [autoLocateMap, setAutoLocateMap] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateStatus, setLocateStatus] = useState('');

  // Form states
  const [formTag, setFormTag] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formPincode, setFormPincode] = useState('');

  // Sync addresses across windows, login/logout, or custom events
  useEffect(() => {
    const syncLocations = () => {
      const list = loadCustomerAddresses();
      setLocations(list);
      setSelectedId(prevId => {
        if (list.some(l => l.id === prevId)) return prevId;
        const def = list.find(l => l.isDefault) || list[0];
        return def ? def.id : null;
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('grabit_auth_updated', syncLocations);
      window.addEventListener('grabit_addresses_updated', syncLocations);
      window.addEventListener('storage', syncLocations);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grabit_auth_updated', syncLocations);
        window.removeEventListener('grabit_addresses_updated', syncLocations);
        window.removeEventListener('storage', syncLocations);
      }
    };
  }, []);

  const guestLocationFallback = {
    id: 'guest',
    title: 'Select Location',
    tag: 'Select Location',
    area: 'Select Location',
    city: 'Bengaluru 560034',
    state: 'Karnataka',
    pincode: '560034',
    address: 'Bengaluru 560034',
    time: '15-25 min delivery',
    radius: '5 km'
  };

  const activeLoc = (locations && locations.length > 0)
    ? (locations.find(l => l.id === selectedId) || locations[0])
    : guestLocationFallback;

  const selectLocation = (loc) => {
    setSelectedId(loc.id);
    setIsModalOpen(false);
  };

  const handleOpenAddForm = () => {
    setEditingLoc(null);
    setFormTag('');
    setFormAddress('');
    setFormArea('');
    setFormPincode('');
    setIsAddingNew(true);
  };

  const handleOpenEditForm = (e, loc) => {
    e.stopPropagation();
    setEditingLoc(loc);
    setFormTag(loc.tag || loc.title || 'Home');
    setFormAddress(loc.address);
    setFormArea(loc.area || '');
    setFormPincode(loc.pincode || '');
    setIsAddingNew(true);
  };

  const handleDeleteLocation = (e, locId) => {
    e.stopPropagation();
    const updated = locations.filter(l => l.id !== locId);
    setLocations(updated);
    if (selectedId === locId) {
      setSelectedId(updated[0]?.id || null);
    }
    saveCustomerAddresses(updated);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!formTag.trim() || !formAddress.trim()) return;

    let updated;
    if (editingLoc) {
      updated = locations.map(l => l.id === editingLoc.id ? {
        ...l,
        title: formTag.trim(),
        tag: formTag.trim(),
        address: formAddress.trim(),
        area: formArea.trim() || formTag.trim(),
        city: formArea.trim() ? `${formArea.trim()}, Bengaluru` : l.city || 'Bengaluru',
        pincode: formPincode.trim() || l.pincode || '560034'
      } : l);
    } else {
      const newLoc = {
        id: Date.now(),
        title: formTag.trim(),
        tag: formTag.trim(),
        isDefault: locations.length === 0,
        address: formAddress.trim(),
        area: formArea.trim() || formTag.trim(),
        city: formArea.trim() ? `${formArea.trim()}, Bengaluru` : 'Bengaluru 560034',
        state: 'Karnataka',
        pincode: formPincode.trim() || '560034',
        time: '15-25 min delivery',
        radius: '5 km'
      };
      updated = [...locations, newLoc];
      setSelectedId(newLoc.id);
    }
    setLocations(updated);
    saveCustomerAddresses(updated);
    setIsAddingNew(false);
  };

  const handleFetchCurrentLocation = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setModalTab('map');
    setAutoLocateMap(true);
  };

  return (
    <LocationContext.Provider value={{
      location: activeLoc,
      locations,
      changeLocation: selectLocation,
      isModalOpen,
      setIsModalOpen
    }}>
      {children}

      {/* 📍 SAVED DELIVERY LOCATIONS MODAL (MATCHING IMAGE 2 EXACTLY) */}
      {isModalOpen && (
        <div
          onClick={() => { setIsModalOpen(false); setIsAddingNew(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: '24px', padding: modalTab === 'map' ? '20px' : '24px',
              maxWidth: modalTab === 'map' ? '480px' : '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative', border: '1px solid #E2E8F0',
              maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {isAddingNew ? (editingLoc ? 'Edit Address' : 'Add New Address') : (modalTab === 'map' ? 'Choose Delivery Location' : 'Saved Delivery Locations')}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setIsAddingNew(false); setModalTab('list'); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#F1F5F9', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: '#64748B', transition: 'background 0.15s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {isAddingNew ? (
              /* ADD / EDIT ADDRESS FORM */
              <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isLocating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px 14px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    color: '#0071E3',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: isLocating ? 'wait' : 'pointer'
                  }}
                >
                  <LocateFixed size={15} color="#0071E3" />
                  <span>{isLocating ? (locateStatus || 'Locating GPS...') : 'Use Current GPS Location'}</span>
                </button>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Address Tag (e.g. Home, Work)</label>
                  <input
                    type="text"
                    placeholder="e.g. Home, Work, Friend's Flat"
                    value={formTag}
                    onChange={e => setFormTag(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 301, Sunshine Heights, 1st Main Rd"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Locality / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar / Koramangala"
                      value={formArea}
                      onChange={e => setFormArea(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 560043"
                      value={formPincode}
                      onChange={e => setFormPincode(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#0071E3', fontWeight: 900, color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,113,227,0.3)' }}
                  >
                    Save &amp; Select
                  </button>
                </div>
              </form>
            ) : modalTab === 'map' ? (
              /* 🗺️ INTERACTIVE LEAFLET MAP VIEW (MATCHING SCREENSHOT 2) */
              <div>
                <DeliveryLocationMapPicker
                  initialLat={activeLoc?.lat || 13.014333}
                  initialLng={activeLoc?.lng || 77.646000}
                  initialTitle={activeLoc?.title || 'Kalpanaaa Software Solutions — Main Office'}
                  autoLocate={autoLocateMap}
                  onSelectLocation={(newLocation) => {
                    const updated = [newLocation, ...locations.filter(l => l.tag !== 'Pinned Location' && l.tag !== 'Current Location')];
                    setLocations(updated);
                    setSelectedId(newLocation.id);
                    saveCustomerAddresses(updated);
                    setIsModalOpen(false);
                    setModalTab('list');
                    setAutoLocateMap(false);
                  }}
                  onClose={() => { setModalTab('list'); setAutoLocateMap(false); }}
                />
              </div>
            ) : (
              /* SAVED ADDRESS CARDS LIST */
              <div>
                {locations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 16px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1', marginBottom: '16px' }}>
                    <MapPin size={32} color="#94A3B8" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>No saved addresses</div>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Add your real delivery address to receive quick 10-minute grocery delivery.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                    {locations.map((loc) => {
                      const isSelected = loc.id === selectedId;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => selectLocation(loc)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                            background: isSelected ? '#F0F7FF' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: isSelected ? '0 4px 16px rgba(0,113,227,0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                            position: 'relative'
                          }}
                        >
                          {/* Top Row: Icon + Tag Name + Badges + Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={16} color={isSelected ? '#0071E3' : '#334155'} strokeWidth={2.2} />
                              <span style={{ fontSize: '14px', fontWeight: 900, color: isSelected ? '#0071E3' : '#0F172A' }}>
                                {loc.tag}
                              </span>
                              {loc.isDefault && (
                                <span style={{
                                  fontSize: '9px', fontWeight: 900, color: '#FFFFFF',
                                  background: '#0071E3', padding: '2px 7px', borderRadius: '10px',
                                  letterSpacing: '0.4px', textTransform: 'uppercase'
                                }}>
                                  DEFAULT
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={(e) => handleOpenEditForm(e, loc)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  background: '#FFFFFF', border: '1px solid #CBD5E1',
                                  padding: '3px 8px', borderRadius: '10px',
                                  fontSize: '11px', fontWeight: 800, color: '#0071E3',
                                  cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                              >
                                <Edit2 size={11} color="#0071E3" /> Edit
                              </button>
                              <button
                                onClick={(e) => handleDeleteLocation(e, loc.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  background: '#FFFFFF', border: '1px solid #FCA5A5',
                                  padding: '3px 8px', borderRadius: '10px',
                                  fontSize: '11px', fontWeight: 800, color: '#EF4444',
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Middle Row: Street Address */}
                          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B', paddingLeft: '24px', lineHeight: 1.4 }}>
                            {loc.address}
                          </div>

                          {/* Delivery Time / ETA Row matching Image 2 */}
                          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0071E3', paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{loc.time || '15-25 min delivery'}</span>
                          </div>

                          {/* Bottom Row: City, State, Pincode */}
                          {loc.city && (
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', paddingLeft: '24px' }}>
                              {loc.city}{loc.state ? `, ${loc.state}` : ''} {loc.pincode}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Primary Action Button: Use Current Location (GPS) */}
                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isLocating}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: '16px',
                    border: '1.5px solid #0071E3',
                    background: isLocating ? '#EFF6FF' : '#0071E3',
                    color: isLocating ? '#0071E3' : '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 900,
                    cursor: isLocating ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                    marginBottom: '10px',
                    boxShadow: isLocating ? 'none' : '0 4px 14px rgba(0, 113, 227, 0.25)'
                  }}
                >
                  <Navigation size={16} color={isLocating ? '#0071E3' : '#FFFFFF'} fill={isLocating ? 'none' : '#FFFFFF'} />
                  <span>{isLocating ? (locateStatus || 'Fetching Current Location...') : 'Use Current Location'}</span>
                </button>

                {/* Dotted Action Button: Add New Delivery Address */}
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    background: '#F8FAFC',
                    color: '#0071E3',
                    fontSize: '13.5px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#0071E3'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                >
                  <Plus size={16} color="#0071E3" strokeWidth={2.5} /> Add New Delivery Address
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
}

export const useDeliveryLocation = () => useContext(LocationContext);
