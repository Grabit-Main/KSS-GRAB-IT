import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, LocateFixed, Check, Radio, ChevronDown, X } from 'lucide-react';

const RADIUS_OPTIONS = [
  { label: '1 km',          value: 1000  },
  { label: '2 km',          value: 2000  },
  { label: '3 km',          value: 3000  },
  { label: '4 km',          value: 4000  },
  { label: '5 km (Default)',value: 5000  },
  { label: '6 km',          value: 6000  },
  { label: '7 km',          value: 7000  },
  { label: '8 km',          value: 8000  },
  { label: '10 km',         value: 10000 },
  { label: '12 km',         value: 12000 },
  { label: '15 km',         value: 15000 },
  { label: '20 km',         value: 20000 },
];

function estimatedTime(r) {
  if (r <= 2000) return '10–15 min';
  if (r <= 5000) return '20–30 min';
  if (r <= 8000) return '35–45 min';
  if (r <= 12000) return '45–60 min';
  return '60–90 min';
}

/** Mobile-safe bottom-sheet picker (amber theme) */
function RadiusBottomSheet({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = RADIUS_OPTIONS.find(o => o.value === value) || RADIUS_OPTIONS[4];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: '10px',
          border: '1.5px solid #FDE68A', background: '#FFFBEB',
          color: '#D97706', fontSize: '13px', fontWeight: 800,
          cursor: 'pointer', boxSizing: 'border-box', gap: '8px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.label}</span>
        <ChevronDown size={15} color="#F59E0B" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.50)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#FFF', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', maxHeight: '72vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>Delivery Radius</span>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Select coverage zone for your store</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={15} color="#475569" />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px 24px' }}>
              {RADIUS_OPTIONS.map(opt => {
                const isSel = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '12px', marginBottom: '4px',
                      border: isSel ? '1.5px solid #F59E0B' : '1.5px solid transparent',
                      background: isSel ? '#FFFBEB' : 'transparent',
                      color: isSel ? '#D97706' : '#0F172A',
                      fontSize: '14px', fontWeight: isSel ? 800 : 600, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '11px', color: isSel ? '#F59E0B' : '#94A3B8', fontWeight: 700 }}>
                      {isSel ? '✓ ' : ''}{estimatedTime(opt.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DeliveryRadiusMapPicker({ storeLat = 13.014333, storeLng = 77.646000, onSave }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef     = useRef(null);
  const markerRef     = useRef(null);

  const [coverageRadius, setCoverageRadius] = useState(() => {
    try { const s = localStorage.getItem('grabit_delivery_radius'); return s ? Number(s) : 5000; }
    catch { return 5000; }
  });
  const [savedNotice,  setSavedNotice]  = useState('');
  const [liveTime,     setLiveTime]     = useState('');
  const [isLocating,   setIsLocating]   = useState(false);
  const [centerCoords, setCenterCoords] = useState({ lat: storeLat, lng: storeLng });

  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const zoomFor = r => r <= 1000 ? 15 : r <= 3000 ? 13 : r <= 6000 ? 12 : r <= 10000 ? 11 : 10;
    const map = L.map(mapContainerRef.current, { center: [centerCoords.lat, centerCoords.lng], zoom: zoomFor(coverageRadius), zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const storeIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.20);animation:pulse 2s infinite ease-in-out;"></div>
        <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:#F59E0B;border:3px solid #FFF;box-shadow:0 4px 14px rgba(245,158,11,0.45);display:flex;align-items:center;justify-content:center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1"></rect><path d="M16 8h4l3 5v3h-7V8z"></path>
            <circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
      </div>`,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });

    const marker = L.marker([centerCoords.lat, centerCoords.lng], { icon: storeIcon, draggable: false }).addTo(map);
    const circle = L.circle([centerCoords.lat, centerCoords.lng], {
      radius: coverageRadius, color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.10, weight: 2.5, dashArray: '6 4',
    }).addTo(map);

    markerRef.current  = marker;
    circleRef.current  = circle;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; circleRef.current = null; markerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!circleRef.current || !mapInstanceRef.current) return;
    circleRef.current.setRadius(coverageRadius);
    mapInstanceRef.current.fitBounds(circleRef.current.getBounds(), { padding: [30, 30] });
  }, [coverageRadius]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setCenterCoords({ lat, lng });
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current) mapInstanceRef.current.panTo([lat, lng]);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    localStorage.setItem('grabit_delivery_radius', String(coverageRadius));
    const label = RADIUS_OPTIONS.find(o => o.value === coverageRadius)?.label || `${coverageRadius / 1000} km`;
    setSavedNotice(`Delivery zone updated to ${label} — Est. ${estimatedTime(coverageRadius)}`);
    setTimeout(() => setSavedNotice(''), 5000);
    if (onSave) onSave({ radius: coverageRadius, lat: centerCoords.lat, lng: centerCoords.lng });
  };

  const currentLabel = RADIUS_OPTIONS.find(o => o.value === coverageRadius)?.label || `${coverageRadius / 1000} km`;

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', color: '#0F172A', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', marginTop: '16px', boxSizing: 'border-box', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <Truck size={16} color="#F59E0B" />
            <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#F59E0B', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              DELIVERY COVERAGE ZONE
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
            The dashed amber circle shows your delivery boundary. Customers outside won't receive delivery.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 800, color: '#D97706', flexShrink: 0 }}>
          <Radio size={12} color="#F59E0B" />
          <span>{currentLabel}</span>
        </div>
      </div>

      {/* 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Zone',     value: currentLabel,              icon: '📍', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Est. Time',value: estimatedTime(coverageRadius), icon: '⏱️', color: '#0071E3', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Status',   value: 'Active',                  icon: '✅', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '3px' }}>{c.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: c.color, lineHeight: '1.2', wordBreak: 'break-word' }}>{c.value}</div>
            <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '300px', zIndex: 1 }} />

        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 500 }}>
          <button
            type="button" onClick={handleLocateMe} disabled={isLocating}
            style={{ background: '#FFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 11px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          >
            <LocateFixed size={13} color="#F59E0B" />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', zIndex: 500, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid #FDE68A', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
            <strong style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Delivery Coverage — {currentLabel}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
              Est. {estimatedTime(coverageRadius)} &nbsp;|&nbsp; {centerCoords.lat.toFixed(3)}, {centerCoords.lng.toFixed(3)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#059669', fontWeight: 800 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Live • {liveTime || 'Online'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.4px' }}>
              Delivery Radius
            </label>
            <RadiusBottomSheet value={coverageRadius} onChange={setCoverageRadius} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.4px' }}>
              Expected Delivery Time
            </label>
            <div style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #BFDBFE', background: '#EFF6FF', color: '#0071E3', fontSize: '13px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⏱️ {estimatedTime(coverageRadius)}
            </div>
          </div>
        </div>

        {coverageRadius > 8000 && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400E', fontWeight: 700 }}>
            ⚠️ Large zone selected ({currentLabel}). Ensure enough riders cover this area.
          </div>
        )}

        {savedNotice && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '12px', fontWeight: 800 }}>
            ✅ {savedNotice}
          </div>
        )}

        <button
          type="button" onClick={handleSave}
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#FFF', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(245,158,11,0.30)', width: '100%', boxSizing: 'border-box' }}
        >
          <Check size={16} /> Save Delivery Zone ({currentLabel})
        </button>
      </div>
    </div>
  );
}