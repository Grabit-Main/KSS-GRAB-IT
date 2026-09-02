import { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // 🚀 AUTOMATIC FIRST-VISIT LOCATION PROMPT
  useEffect(() => {
    try {
      const isConfirmed = localStorage.getItem('grabit_location_confirmed');
      const isDismissed = sessionStorage.getItem('grabit_location_prompt_dismissed');
      if (!isConfirmed && !isDismissed) {
        setIsModalOpen(true);
      }
    } catch (e) {
      console.warn('Auto location prompt check error:', e);
    }
  }, []);

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

  const activeLoc = locations.find(l => l.id === selectedId) || locations[0] || DEFAULT_CUSTOMER_ADDRESSES[0];

  const selectLocation = (loc) => {
    setSelectedId(loc.id);
    try {
      localStorage.setItem('grabit_location_confirmed', 'true');
    } catch (e) {}
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAddingNew(false);
    setModalTab('list');
    try {
      sessionStorage.setItem('grabit_location_prompt_dismissed', 'true');
    } catch (e) {}
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
    try {
      localStorage.setItem('grabit_location_confirmed', 'true');
    } catch (err) {}
    setIsAddingNew(false);
    setIsModalOpen(false);
  };

  // 🧭 OPTION 1: USE CURRENT LOCATION (GPS + OpenStreetMap Nominatim Reverse Geocoding)
  const handleUseCurrentGpsLocation = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please use "Set Address" to choose your location manually.');
      setModalTab('map');
      return;
    }

    setIsLocating(true);
    setLocateStatus('Detecting GPS location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocateStatus('Fetching address details...');

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          let fullAddress = 'Current Delivery Location';
          let area = 'Bengaluru';
          let city = 'Bengaluru';
          let state = 'Karnataka';
          let postcode = '560001';
          let title = 'Current Location';

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number ? `${addr.house_number}, ` : '';
            area = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || 'Bengaluru';
            city = addr.city || addr.town || addr.municipality || 'Bengaluru';
            state = addr.state || 'Karnataka';
            postcode = addr.postcode || '560001';
            title = data.name || (road ? `${road}, ${area}` : `${area}, ${city}`);
            fullAddress = `${house}${road ? road + ', ' : ''}${area}`;
          }

          const newGpsLocation = {
            id: Date.now(),
            title: title.length > 35 ? title.slice(0, 35) + '...' : title,
            tag: 'Current Location',
            isDefault: true,
            address: fullAddress,
            area: area,
            city: `${city} ${postcode}`,
            state: state,
            pincode: postcode,
            lat: lat,
            lng: lng,
            time: '15-25 min delivery',
            radius: '5 km'
          };

          const updated = [newGpsLocation, ...locations.filter(l => l.tag !== 'Current Location')];
          setLocations(updated);
          setSelectedId(newGpsLocation.id);
          saveCustomerAddresses(updated);
          localStorage.setItem('grabit_location_confirmed', 'true');
          setIsModalOpen(false);
          setIsAddingNew(false);
          setModalTab('list');
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          const fallbackLoc = {
            id: Date.now(),
            title: 'Current Location',
            tag: 'Current Location',
            isDefault: true,
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
            area: 'Bengaluru',
            city: 'Bengaluru 560001',
            state: 'Karnataka',
            pincode: '560001',
            lat: lat,
            lng: lng,
            time: '15-25 min delivery',
            radius: '5 km'
          };
          const updated = [fallbackLoc, ...locations.filter(l => l.tag !== 'Current Location')];
          setLocations(updated);
          setSelectedId(fallbackLoc.id);
          saveCustomerAddresses(updated);
          localStorage.setItem('grabit_location_confirmed', 'true');
          setIsModalOpen(false);
        } finally {
          setIsLocating(false);
          setLocateStatus('');
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        setLocateStatus('');
        alert('GPS location permission was denied or unavailable. Please click "Set Address" to enter your address or pick on map.');
        setModalTab('map');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // 📍 OPTION 2: SET ADDRESS (Open Map Picker or Manual Entry)
  const handleOpenSetAddress = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setModalTab('map');
    setAutoLocateMap(false);
    setIsAddingNew(false);
  };

  const handleFetchCurrentLocation = handleUseCurrentGpsLocation;

  const modalContent = isModalOpen && (
    <div
      onClick={handleCloseModal}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: '24px', padding: modalTab === 'map' ? '20px' : '24px',
          maxWidth: modalTab === 'map' ? '500px' : '450px', width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          position: 'relative', border: '1px solid #E2E8F0',
          maxHeight: '92vh', overflowY: 'auto'
        }}
      >
        {/* Modal Close Button */}
        <button
          onClick={handleCloseModal}
          aria-label="Close location modal"
          style={{
            position: 'absolute', top: '18px', right: '18px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#F1F5F9', border: 'none', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: '#64748B', transition: 'background 0.15s', zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* WELCOMING LOCATION PROMPT HEADER */}
        {!isAddingNew && modalTab === 'list' && (
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '4px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
              color: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', boxShadow: '0 8px 20px -4px rgba(0, 113, 227, 0.25)'
            }}>
              <MapPin size={26} strokeWidth={2.4} />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Select Delivery Location
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4, maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
              Add your delivery address to see live stock availability and 10-minute delivery in your area.
            </p>
          </div>
        )}

        {/* HEADER FOR MAP OR ADD FORM */}
        {(isAddingNew || modalTab === 'map') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              {isAddingNew ? (editingLoc ? 'Edit Address' : 'Add New Address') : 'Pin Delivery Location on Map'}
            </h3>
          </div>
        )}

        {/* 2 PROMINENT ACTION BUTTONS REQUESTED BY USER */}
        {!isAddingNew && modalTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {/* OPTION 1: USE CURRENT LOCATION */}
            <button
              type="button"
              id="btn-use-current-location"
              onClick={handleUseCurrentGpsLocation}
              disabled={isLocating}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '16px',
                border: 'none',
                background: isLocating ? '#EFF6FF' : 'linear-gradient(135deg, #0071E3 0%, #0056B3 100%)',
                color: isLocating ? '#0071E3' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: 900,
                cursor: isLocating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: isLocating ? 'none' : '0 6px 18px rgba(0, 113, 227, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Navigation size={18} fill={isLocating ? 'none' : '#FFFFFF'} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, lineHeight: 1.2 }}>
                  {isLocating ? (locateStatus || 'Locating GPS...') : 'Use Current Location'}
                </div>
                <div style={{ fontSize: '11px', opacity: isLocating ? 0.7 : 0.9, fontWeight: 600 }}>
                  Detect device GPS & fetch street address
                </div>
              </div>
            </button>

            {/* OPTION 2: SET ADDRESS */}
            <button
              type="button"
              id="btn-set-address"
              onClick={handleOpenSetAddress}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '16px',
                border: '1.5px solid #0071E3',
                background: '#FFFFFF',
                color: '#0071E3',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F0F7FF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <MapPin size={18} strokeWidth={2.4} color="#0071E3" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, lineHeight: 1.2 }}>Set Address / Pin on Map</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Interactive map picker & address search</div>
              </div>
            </button>
          </div>
        )}

        {isAddingNew ? (
          /* ADD / EDIT ADDRESS FORM */
          <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button
              type="button"
              onClick={handleUseCurrentGpsLocation}
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
              <span>{isLocating ? (locateStatus || 'Locating GPS...') : 'Fetch Address from Current GPS'}</span>
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
          /* 🗺️ INTERACTIVE LEAFLET MAP VIEW */
          <div>
            <DeliveryLocationMapPicker
              initialLat={activeLoc?.lat || 13.014333}
              initialLng={activeLoc?.lng || 77.646000}
              initialTitle={activeLoc?.title || 'Selected Delivery Location'}
              autoLocate={autoLocateMap}
              onSelectLocation={(newLocation) => {
                const updated = [newLocation, ...locations.filter(l => l.tag !== 'Pinned Location' && l.tag !== 'Current Location')];
                setLocations(updated);
                setSelectedId(newLocation.id);
                saveCustomerAddresses(updated);
                try {
                  localStorage.setItem('grabit_location_confirmed', 'true');
                } catch (e) {}
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
            {locations.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 12px', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Or Choose From Saved Addresses
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {locations.map((loc) => {
                const isSelected = loc.id === selectedId;
                return (
                  <div
                    key={loc.id}
                    onClick={() => selectLocation(loc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                      background: isSelected ? '#F0F7FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(0,113,227,0.1)' : '0 1px 4px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Icon + Tag Name + Badges + Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} color={isSelected ? '#0071E3' : '#334155'} strokeWidth={2.2} />
                        <span style={{ fontSize: '13.5px', fontWeight: 900, color: isSelected ? '#0071E3' : '#0F172A' }}>
                          {loc.tag || loc.title}
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
                            padding: '3px 7px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 800, color: '#0071E3',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={11} color="#0071E3" /> Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteLocation(e, loc.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: '#FFFFFF', border: '1px solid #FCA5A5',
                            padding: '3px 7px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 800, color: '#EF4444',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Street Address */}
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', paddingLeft: '23px', lineHeight: 1.35 }}>
                      {loc.address}
                    </div>

                    {/* Delivery Time / ETA Row */}
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0071E3', paddingLeft: '23px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{loc.time || '15-25 min delivery'}</span>
                    </div>

                    {/* Bottom Row: City, State, Pincode */}
                    {loc.city && (
                      <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B', paddingLeft: '23px' }}>
                        {loc.city}{loc.state ? `, ${loc.state}` : ''} {loc.pincode}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dotted Action Button: Add New Delivery Address Manually */}
            <button
              type="button"
              id="btn-add-manual-address"
              onClick={handleOpenAddForm}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '1.5px dashed #CBD5E1',
                background: '#F8FAFC',
                color: '#0071E3',
                fontSize: '13px',
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
              <Plus size={15} color="#0071E3" strokeWidth={2.5} /> Enter Address Details Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <LocationContext.Provider value={{
      location: activeLoc,
      locations,
      changeLocation: selectLocation,
      isModalOpen,
      setIsModalOpen,
      handleUseCurrentGpsLocation,
      handleOpenSetAddress
    }}>
      {children}
      {isModalOpen && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </LocationContext.Provider>
  );
}

export const useDeliveryLocation = () => useContext(LocationContext);
