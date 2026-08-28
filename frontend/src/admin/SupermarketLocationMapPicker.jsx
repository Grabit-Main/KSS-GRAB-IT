import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, LocateFixed, Check, MapPin, ChevronDown, X } from 'lucide-react';

const GEOFENCE_OPTIONS = [
  { label: '50 m Radius',       value: 50   },
  { label: '100 m Radius',      value: 100  },
  { label: '250 m Radius',      value: 250  },
  { label: '500 m Radius',      value: 500  },
  { label: '1,000 m Radius',    value: 1000 },
];

/** Reusable mobile-safe bottom-sheet picker */
function BottomSheetPicker({ value, options, onChange, accentColor = '#0071E3', bgColor = '#EFF6FF', borderColor = '#BFDBFE' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: '10px',
          border: `1.5px solid ${borderColor}`, background: bgColor,
          color: accentColor, fontSize: '13px', fontWeight: 800,
          cursor: 'pointer', boxSizing: 'border-box', gap: '8px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.label}</span>
        <ChevronDown size={15} color={accentColor} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.50)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#FFF', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#CBD5E1' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>Choose Radius</span>
              <button onClick={() => setOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#475569" />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px 24px' }}>
              {options.map(opt => {
                const isSel = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '12px', marginBottom: '4px',
                      border: isSel ? `1.5px solid ${accentColor}` : '1.5px solid transparent',
                      background: isSel ? bgColor : 'transparent',
                      color: isSel ? accentColor : '#0F172A',
                      fontSize: '14px', fontWeight: isSel ? 800 : 600,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSel && <span style={{ fontWeight: 900 }}>✓</span>}
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

export default function SupermarketLocationMapPicker({
  initialLat = 13.014333,
  initialLng = 77.646000,
  initialTitle = 'GrabIt Store — Main Hub',
  initialRadius = 100,
  onSaveLocation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [geofenceRadius, setGeofenceRadius] = useState(initialRadius);
  const [storeTitle, setStoreTitle] = useState(initialTitle);
  const [resolvedAddress, setResolvedAddress] = useState('Near 9th Main Road, HRBR Layout 1st Block, Banaswadi, Bengaluru 560043');
  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    setIsResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || 'Main Market Road';
        const area = addr.suburb || addr.neighbourhood || addr.city_district || 'Banaswadi';
        const city = addr.city || addr.town || 'Bengaluru';
        const postcode = addr.postcode || '560043';
        setStoreTitle(`GrabIt Store — ${area}`);
        setResolvedAddress(`${road}, ${area}, ${city} ${postcode}`);
      }
    } catch {
      setResolvedAddress('HRBR Layout 1st Block, Banaswadi, Bengaluru 560043');
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const pinIcon = L.divIcon({
      className: 'supermarket-pulse-marker',
      html: `
        <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(0,113,227,0.22);animation:pulse 2s infinite ease-in-out;"></div>
          <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:#0071E3;border:3px solid #FFF;box-shadow:0 4px 14px rgba(0,113,227,0.4);display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      const marker = L.marker([coords.lat, coords.lng], { icon: pinIcon, draggable: true }).addTo(map);
      const circle = L.circle([coords.lat, coords.lng], {
        radius: geofenceRadius, color: '#0071E3', fillColor: '#0071E3', fillOpacity: 0.16, weight: 2
      }).addTo(map);
      markerRef.current = marker;
      circleRef.current = circle;
      mapInstanceRef.current = map;

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const lat = parseFloat(newPos.lat.toFixed(6));
        const lng = parseFloat(newPos.lng.toFixed(6));
        setCoords({ lat, lng });
        circle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6));
        const lng = parseFloat(e.latlng.lng.toFixed(6));
        setCoords({ lat, lng });
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(geofenceRadius);
  }, [geofenceRadius]);

  const updateMapPosition = (lat, lng) => {
    setCoords({ lat, lng });
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
    if (mapInstanceRef.current) mapInstanceRef.current.panTo([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMapPosition(parseFloat(pos.coords.latitude.toFixed(6)), parseFloat(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      () => { setIsLocating(false); updateMapPosition(13.014333, 77.646000); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    const data = { lat: coords.lat, lng: coords.lng, radius: geofenceRadius, title: storeTitle, address: resolvedAddress };
    if (onSaveLocation) onSaveLocation(data);
    setSavedNotice(`Saved: ${storeTitle} — ${coords.lat}, ${coords.lng} (${geofenceRadius}m)`);
    setTimeout(() => setSavedNotice(''), 4000);
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '16px', color: '#0F172A', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0', boxSizing: 'border-box', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <Navigation size={16} color="#0071E3" />
            <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#0071E3', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              INTERACTIVE MAP &amp; GEOFENCE
            </h3>
          </div>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
            Drag the pin or tap the map to set store coordinates.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 800, color: '#0071E3', flexShrink: 0 }}>
          <MapPin size={12} color="#0071E3" />
          <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '300px', zIndex: 1 }} />

        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 500 }}>
          <button
            type="button" onClick={handleLocateMe} disabled={isLocating}
            style={{ background: '#FFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 11px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          >
            <LocateFixed size={13} color="#0071E3" />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', zIndex: 500, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '10px 14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0071E3', display: 'inline-block', flexShrink: 0 }} />
            <strong style={{ fontSize: '12.5px', fontWeight: 900, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeTitle}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
              Radius: {geofenceRadius}m &nbsp;|&nbsp; {coords.lat} &nbsp;|&nbsp; {coords.lng}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#059669', fontWeight: 800 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Cloud Live • {liveTime || 'Online'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls below map */}
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Address & Geofence — stacked on mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.4px' }}>
              Resolved Address
            </label>
            <input
              readOnly
              value={isResolving ? 'Resolving location...' : resolvedAddress}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', background: '#F8FAFC', color: '#0F172A', fontSize: '12.5px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.4px' }}>
              Store Geofence
            </label>
            <BottomSheetPicker
              value={geofenceRadius}
              options={GEOFENCE_OPTIONS}
              onChange={setGeofenceRadius}
              accentColor="#0071E3"
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
            />
          </div>
        </div>

        {savedNotice && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '12px', fontWeight: 800 }}>
            ✅ {savedNotice}
          </div>
        )}

        <button
          type="button" onClick={handleSave}
          style={{ background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '13px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,113,227,0.25)', width: '100%', boxSizing: 'border-box' }}
        >
          <Check size={16} /> Save GrabIt Store Location
        </button>
      </div>
    </div>
  );
}