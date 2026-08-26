import { createContext, useContext, useState } from 'react';
import { MapPin, Edit2, Plus, X } from 'lucide-react';

const LocationContext = createContext();

export const defaultLocationsList = [
  {
    id: 1,
    tag: 'Home (Primary)',
    isDefault: true,
    address: 'Banaswadi 1st Main Rd, HRBR Layout',
    area: 'Banaswadi',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560043',
    radius: '5 km'
  },
  {
    id: 2,
    tag: 'Work Office',
    isDefault: false,
    address: '100ft Road, Indiranagar',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    radius: '4 km'
  },
  {
    id: 3,
    tag: 'Parents House',
    isDefault: false,
    address: '2nd Block, HRBR Layout, Kalyan Nagar',
    area: 'Kalyan Nagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560043',
    radius: '5 km'
  }
];

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState(defaultLocationsList);
  const [selectedId, setSelectedId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  // Form states
  const [formTag, setFormTag] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formPincode, setFormPincode] = useState('');

  const activeLoc = locations.find(l => l.id === selectedId) || locations[0];

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
    setFormTag(loc.tag);
    setFormAddress(loc.address);
    setFormArea(loc.area);
    setFormPincode(loc.pincode);
    setIsAddingNew(true);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!formTag || !formAddress || !formArea) return;

    if (editingLoc) {
      setLocations(prev => prev.map(l => l.id === editingLoc.id ? {
        ...l,
        tag: formTag,
        address: formAddress,
        area: formArea,
        pincode: formPincode || '560043'
      } : l));
    } else {
      const newLoc = {
        id: Date.now(),
        tag: formTag,
        isDefault: false,
        address: formAddress,
        area: formArea,
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: formPincode || '560043',
        radius: '5 km'
      };
      setLocations(prev => [...prev, newLoc]);
      setSelectedId(newLoc.id);
    }
    setIsAddingNew(false);
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
              background: '#FFFFFF', borderRadius: '24px', padding: '24px',
              maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative', border: '1px solid #E2E8F0'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {isAddingNew ? (editingLoc ? 'Edit Address' : 'Add New Address') : 'Saved Delivery Locations'}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setIsAddingNew(false); }}
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
                    placeholder="e.g. Banaswadi 1st Main Rd, HRBR Layout"
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
                      placeholder="e.g. Banaswadi"
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
            ) : (
              /* SAVED ADDRESS CARDS LIST (EXACT IMAGE 2) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {locations.map((loc) => {
                  const isSelected = loc.id === selectedId;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => selectLocation(loc)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F7FF' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,113,227,0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                        position: 'relative'
                      }}
                    >
                      {/* Top Row: Icon + Tag Name + Badges + Edit Button */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={18} color={isSelected ? '#0071E3' : '#334155'} strokeWidth={2.2} />
                          <span style={{ fontSize: '15px', fontWeight: 900, color: isSelected ? '#0071E3' : '#0F172A' }}>
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

                        <button
                          onClick={(e) => handleOpenEditForm(e, loc)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: '#FFFFFF', border: '1px solid #CBD5E1',
                            padding: '4px 10px', borderRadius: '12px',
                            fontSize: '12px', fontWeight: 800, color: '#0071E3',
                            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Edit2 size={12} color="#0071E3" /> Edit
                        </button>
                      </div>

                      {/* Middle Row: Street Address */}
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', paddingLeft: '26px' }}>
                        {loc.address}
                      </div>

                      {/* Bottom Row: City, State, Pincode */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', paddingLeft: '26px' }}>
                        {loc.city}, {loc.state} {loc.pincode}
                      </div>
                    </div>
                  );
                })}

                {/* Dotted Action Button: Add New Delivery Address */}
                <button
                  onClick={handleOpenAddForm}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1.5px dashed #0071E3',
                    background: '#FFFFFF',
                    color: '#0071E3',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  <Plus size={18} color="#0071E3" strokeWidth={2.5} /> Add New Delivery Address
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
