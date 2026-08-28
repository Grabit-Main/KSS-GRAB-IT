import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, LocateFixed, Check, Radio, MapPin } from 'lucide-react';

// Radius options in meters — 1km to 20km
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '3 km', value: 3000 },
  { label: '4 km', value: 4000 },
  { label: '5 km (Default)', value: 5000 },
  { label: '6 km', value: 6000 },
  { label: '7 km', value: 7000 },
  { label: '8 km', value: 8000 },
  { label: '10 km', value: 10000 },
  { label: '12 km', value: 12000 },
  { label: '15 km', value: 15000 },
  { label: '20 km', value: 20000 },
];

// Estimated delivery time based on radius
function estimatedTime(radiusM) {
  if (radiusM <= 2000) return '10–15 min';
  if (radiusM <= 5000) return '20–30 min';
  if (radiusM <= 8000) return '35–45 min';
  if (radiusM <= 12000) return '45–60 min';
  return '60–90 min';
}

export default function DeliveryRadiusMapPicker({
  storeLat = 13.014333,
  storeLng = 77.646000,
  onSave
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const markerRef = useRef(null);

  // Load persisted radius from localStorage (default 5km)
  const [coverageRadius, setCoverageRadius] = useState(() => {
    try {
      const saved = localStorage.getItem('grabit_delivery_radius');
      return saved ? Number(saved) : 5000;
    } catch {
      return 5000;
    }
  });

  const [savedNotice, setSavedNotice] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [centerCoords, setCenterCoords] = useState({ lat: storeLat, lng: storeLng });

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Zoom level that shows ~5km radius nicely
    const zoomForRadius = (r) => {
      if (r <= 1000) return 15;
      if (r <= 3000) return 13;
      if (r <= 6000) return 12;
      if (r <= 10000) return 11;
      return 10;
    };

    const map = L.map(mapContainerRef.current, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: zoomForRadius(coverageRadius),
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Store location marker (amber/orange pin)
    const storeIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,0.20);animation:pulse 2s infinite ease-in-out;"></div>
          <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:#F59E0B;border:3px solid #FFFFFF;box-shadow:0 4px 14px rgba(245,158,11,0.45);display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1"></rect>
              <path d="M16 8h4l3 5v3h-7V8z"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([centerCoords.lat, centerCoords.lng], {
      icon: storeIcon,
      draggable: false,
    }).addTo(map);

    // Amber delivery zone circle
    const circle = L.circle([centerCoords.lat, centerCoords.lng], {
      radius: coverageRadius,
      color: '#F59E0B',
      fillColor: '#F59E0B',
      fillOpacity: 0.10,
      weight: 2.5,
      dashArray: '6 4',
    }).addTo(map);

    markerRef.current = marker;
    circleRef.current = circle;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        circleRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update circle when radius changes
  useEffect(() => {
    if (!circleRef.current || !mapInstanceRef.current) return;
    circleRef.current.setRadius(coverageRadius);
    // Re-zoom map to fit circle
    const bounds = circleRef.current.getBounds();
    mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
  }, [coverageRadius]);

  // Locate store via GPS (drag center)
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
    const label = RADIUS_OPTIONS.find((o) => o.value === coverageRadius)?.label || `${coverageRadius / 1000} km`;
    setSavedNotice(`✅ Delivery zone updated to ${label} — Est. delivery: ${estimatedTime(coverageRadius)}`);
    setTimeout(() => setSavedNotice(''), 5000);
    if (onSave) onSave({ radius: coverageRadius, lat: centerCoords.lat, lng: centerCoords.lng });
  };

  const currentLabel = RADIUS_OPTIONS.find((o) => o.value === coverageRadius)?.label || `${coverageRadius / 1000} km`;

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '18px',
      padding: '20px',
      color: '#0F172A',
      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      border: '1px solid #E2E8F0',
      marginTop: '20px',
    }}>
      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Truck size={18} color="#F59E0B" />
            <h3 style={{
              fontSize: '14px', fontWeight: 900, color: '#F59E0B',
              margin: 0, letterSpacing: '0.6px', textTransform: 'uppercase',
            }}>
              DELIVERY COVERAGE ZONE
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
            Set the delivery radius for your store. The dashed amber circle shows the coverage zone.
            Customers outside this zone won't receive delivery.
          </p>
        </div>

        {/* Radius badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: '10px', padding: '6px 12px',
          fontSize: '12.5px', fontWeight: 800, color: '#D97706',
        }}>
          <Radio size={13} color="#F59E0B" />
          <span>{currentLabel}</span>
        </div>
      </div>

      {/* ── INFO CARDS (stats row) ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px',
      }}>
        {[
          { label: 'Current Zone', value: currentLabel, icon: '📍', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Est. Delivery', value: estimatedTime(coverageRadius), icon: '⏱️', color: '#0071E3', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Zone Status', value: 'Active', icon: '✅', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
        ].map((card) => (
          <div key={card.label} style={{
            background: card.bg, border: `1px solid ${card.border}`,
            borderRadius: '12px', padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{card.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: card.color, lineHeight: '1.2' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAP ── */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '360px', zIndex: 1 }} />

        {/* GPS locate button */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 500 }}>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              background: '#FFFFFF', color: '#0F172A',
              border: '1px solid #CBD5E1', borderRadius: '8px',
              padding: '8px 12px', fontSize: '11.5px', fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
            }}
          >
            <LocateFixed size={14} color="#F59E0B" />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* Bottom overlay info banner */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 500,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          borderRadius: '12px', padding: '12px 16px', border: '1px solid #FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              <strong style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>
                Delivery Coverage Zone — {currentLabel}
              </strong>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontWeight: 600 }}>
              Center: {centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)} &nbsp;|&nbsp; Est. time: {estimatedTime(coverageRadius)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#059669', fontWeight: 800 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
            <span>Live &nbsp;•&nbsp; {liveTime || 'Online'}</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS BELOW MAP ── */}
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Radius selector */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569',
              textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px',
            }}>
              Delivery Radius
            </label>
            <select
              value={coverageRadius}
              onChange={(e) => setCoverageRadius(Number(e.target.value))}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1.5px solid #FDE68A', background: '#FFFBEB',
                color: '#D97706', fontSize: '12.5px', fontWeight: 800,
                outline: 'none', cursor: 'pointer',
              }}
            >
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Estimated delivery time display */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569',
              textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px',
            }}>
              Expected Delivery Time
            </label>
            <div style={{
              padding: '9px 12px', borderRadius: '8px',
              border: '1.5px solid #BFDBFE', background: '#EFF6FF',
              color: '#0071E3', fontSize: '13px', fontWeight: 900,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              ⏱️ {estimatedTime(coverageRadius)}
            </div>
          </div>
        </div>

        {/* Warning for large radius */}
        {coverageRadius > 8000 && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '12px', color: '#92400E', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ Large radius selected ({currentLabel}). Ensure you have enough riders to cover this zone before saving.
          </div>
        )}

        {/* Saved notice */}
        {savedNotice && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px',
            background: '#ECFDF5', border: '1px solid #A7F3D0',
            color: '#047857', fontSize: '12.5px', fontWeight: 800,
          }}>
            {savedNotice}
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF', border: 'none',
            borderRadius: '10px', padding: '12px',
            fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', boxShadow: '0 4px 14px rgba(245,158,11,0.30)',
          }}
        >
          <Check size={16} /> Save Delivery Zone ({currentLabel})
        </button>
      </div>
    </div>
  );
}
